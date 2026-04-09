import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import PGMem from "pg-mem";
import { PostQueryService } from "./post-query.service";
import { PostNotFoundError } from "./post.errors";
import { InvalidCursorError } from "src/common/errors/pagination.errors";
import { Post, PostCategory } from "./entities/post.entity";
import { PostLike } from "./entities/post-like.entity";
import { Attachment } from "../attachment/entities/attachment.entity";
import { User, UserRole } from "../user/entities/user.entity";
import { UserProfile } from "../user/entities/user-profile.entity";
import { initializePgMem } from "src/test/pg-mem.helper";
import { S3StorageService } from "src/s3-storage/s3-storage.service";
import { FakeS3StorageService } from "src/s3-storage/s3-storage.service.fake";
import { PostComment } from "src/comment/entities/post-comment.entity";

const entities = [UserProfile, User, PostComment, Post, PostLike, Attachment];

let userCounter = 0;

async function saveTestUser(
  repository: Repository<User>,
  overrides?: Partial<User>,
): Promise<User> {
  return repository.save(
    repository.create({
      email: `user${++userCounter}@test.com`,
      password: "password",
      role: UserRole.USER,
      ...overrides,
    }),
  );
}

async function saveTestPost(
  repository: Repository<Post>,
  userId: number,
  overrides?: Partial<Post>,
): Promise<Post> {
  return repository.save(
    repository.create({
      content: "test content",
      category: PostCategory.DUMMY1,
      nickname: "testnick",
      author: { id: userId } as User,
      ...overrides,
    }),
  );
}

async function saveTestPosts(
  repository: Repository<Post>,
  userId: number,
  overridesList: Partial<Post>[],
): Promise<number[]> {
  const ids: number[] = [];
  for (const overrides of overridesList) {
    ids.push((await saveTestPost(repository, userId, overrides)).id);
  }
  return ids;
}

describe("PostQueryService", () => {
  let module: TestingModule;
  let postQueryService: PostQueryService;
  let postRepository: Repository<Post>;
  let postLikeRepository: Repository<PostLike>;
  let attachmentRepository: Repository<Attachment>;
  let userRepository: Repository<User>;
  let fakeS3: FakeS3StorageService;
  let dataSource: DataSource;
  let dbBackup: PGMem.IBackup;

  beforeAll(async () => {
    const { dataSource: ds, backup } = await initializePgMem(entities);
    dataSource = ds;
    dbBackup = backup;

    fakeS3 = new FakeS3StorageService();

    module = await Test.createTestingModule({
      providers: [
        PostQueryService,
        {
          provide: getRepositoryToken(Post),
          useValue: dataSource.getRepository(Post),
        },
        {
          provide: getRepositoryToken(PostLike),
          useValue: dataSource.getRepository(PostLike),
        },
        {
          provide: getRepositoryToken(Attachment),
          useValue: dataSource.getRepository(Attachment),
        },
        { provide: S3StorageService, useValue: fakeS3 },
      ],
    }).compile();

    postQueryService = module.get(PostQueryService);
    postRepository = dataSource.getRepository(Post);
    postLikeRepository = dataSource.getRepository(PostLike);
    attachmentRepository = dataSource.getRepository(Attachment);
    userRepository = dataSource.getRepository(User);
  });

  beforeEach(() => {
    dbBackup.restore();
    fakeS3.reset();
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  describe("listPosts", () => {
    describe("pagination", () => {
      // 2026-03-23: success 처리를 parameter의 조합별로 더 테스트하는 것이 더
      // 엄밀하지만, 현재는 그럴 필요가 없다고 판단하여 success 케이스 하나만
      // 처리합니다.
      it("success: 각 parameter 처리", async () => {
        // Given: posts
        const user = await saveTestUser(userRepository);
        const ids = await saveTestPosts(postRepository, user.id, [
          { category: PostCategory.DUMMY1 },
          { category: PostCategory.DUMMY1 },
          { category: PostCategory.DUMMY1 },
          { category: PostCategory.DUMMY2 },
          { category: PostCategory.DUMMY1 },
        ]);

        // When: 글 조회 시도
        const result = await postQueryService.listPosts(user.id, {
          limit: 2,
          category: PostCategory.DUMMY1,
          orderBy: "createdAt",
          orderDirection: "asc",
        });

        // Then: 올바른 결과 반환
        expect(result.items.map((p) => p.post.id)).toEqual([ids[0], ids[1]]);
        expect(result.nextCursor).toBeDefined();

        // When: nextCursor로 글 조회 시도
        const result2 = await postQueryService.listPosts(user.id, {
          cursor: result.nextCursor,
          limit: 2,
          category: PostCategory.DUMMY1,
          orderBy: "createdAt",
          orderDirection: "asc",
        });

        // Then: 올바른 결과 반환
        expect(result2.items.map((p) => p.post.id)).toEqual([ids[2], ids[4]]);
        expect(result2.nextCursor).toBeUndefined();
      });

      it("success: cursor에 해당하는 글이 삭제된 경우 올바르게 처리", async () => {
        // Given: cursor에 해당하는 글이 삭제된 경우
        const user = await saveTestUser(userRepository);
        const ids = await saveTestPosts(postRepository, user.id, [{}, {}, {}]);

        const firstPage = await postQueryService.listPosts(user.id, {
          limit: 1,
          orderBy: "createdAt",
          orderDirection: "asc",
        });
        await postRepository.delete(ids[0]);

        // When: 글 조회 시도
        const result = await postQueryService.listPosts(user.id, {
          cursor: firstPage.nextCursor,
          limit: 2,
          orderBy: "createdAt",
          orderDirection: "asc",
        });

        // Then: 삭제된 글 다음부터 올바르게 반환
        expect(result.items.map((p) => p.post.id)).toEqual([ids[1], ids[2]]);
      });

      it("category 및 orderBy와 벗어난 cursor 처리", async () => {
        // Given: cursor가 category 및 orderBy를 다르게 하여 조회했을 때의
        // 결과물인 경우
        const user = await saveTestUser(userRepository);
        await saveTestPosts(postRepository, user.id, [
          { category: PostCategory.DUMMY1 },
          { category: PostCategory.DUMMY1 },
        ]);
        const firstPage = await postQueryService.listPosts(user.id, {
          limit: 1,
          orderBy: "createdAt",
          orderDirection: "asc",
          category: PostCategory.DUMMY1,
        });

        // When: 글 조회 시도
        const result = postQueryService.listPosts(user.id, {
          cursor: firstPage.nextCursor,
          limit: 1,
          orderBy: "createdAt",
          orderDirection: "asc",
          category: PostCategory.DUMMY2,
        });

        // Then: throws handled error
        await expect(result).rejects.toThrow(InvalidCursorError);
      });
    });

    describe("relation fields", () => {
      it("success: user가 owner -> isOwner true", async () => {
        // Given: 사용자 및 글 (테스트를 위해 단일로만 저장)
        const user = await saveTestUser(userRepository);
        await saveTestPost(postRepository, user.id);

        // When: 글 목록 조회 시도
        const result = await postQueryService.listPosts(user.id, {
          limit: 1,
          orderBy: "createdAt",
          orderDirection: "asc",
        });

        // Then: isOwner === true
        expect(result.items[0].withUser.isOwner).toBe(true);
      });

      it("success: user가 owner 아님 -> isOwner false", async () => {
        // Given: 글 작성자와 다른 사용자
        const author = await saveTestUser(userRepository);
        const viewer = await saveTestUser(userRepository);
        await saveTestPost(postRepository, author.id);

        // When: viewer로 글 목록 조회 시도
        const result = await postQueryService.listPosts(viewer.id, {
          limit: 1,
          orderBy: "createdAt",
          orderDirection: "asc",
        });

        // Then: isOwner === false
        expect(result.items[0].withUser.isOwner).toBe(false);
      });

      it("success: user가 like한 글 -> isLiked true", async () => {
        // Given: user가 like한 글
        const user = await saveTestUser(userRepository);
        const post = await saveTestPost(postRepository, user.id);
        await postLikeRepository.save(
          postLikeRepository.create({
            user: { id: user.id },
            post: { id: post.id },
          }),
        );

        // When: 글 목록 조회 시도
        const result = await postQueryService.listPosts(user.id, {
          limit: 1,
          orderBy: "createdAt",
          orderDirection: "asc",
        });

        // Then: isLiked === true
        expect(result.items[0].withUser.isLiked).toBe(true);
      });

      it("success: user가 like 하지 않은 글 -> isLiked false", async () => {
        // Given: user가 like하지 않은 글
        const user = await saveTestUser(userRepository);
        await saveTestPost(postRepository, user.id);

        // When: 글 목록 조회 시도
        const result = await postQueryService.listPosts(user.id, {
          limit: 1,
          orderBy: "createdAt",
          orderDirection: "asc",
        });

        // Then: isLiked === false
        expect(result.items[0].withUser.isLiked).toBe(false);
      });
    });

    it("success: 올바른 attachments URL 맵 반환", async () => {
      // Given: attachment가 있는 글
      const user = await saveTestUser(userRepository);
      const post = await saveTestPost(postRepository, user.id);
      const attachment = await attachmentRepository.save(
        attachmentRepository.create({
          confirmed: true,
          s3Key: "attachments/test-key",
          index: 0,
          post,
        }),
      );

      // When: 글 목록 조회 시도
      const result = await postQueryService.listPosts(user.id, {
        limit: 1,
        orderBy: "createdAt",
        orderDirection: "asc",
      });

      // Then: attachment URL 맵 올바르게 반환
      expect(result.attachmentToUrl[attachment.id]).toBe(
        fakeS3.getPublicUrl(attachment.s3Key),
      );
    });
  });

  describe("getPost", () => {
    it("success: 올바른 fields 반환", async () => {
      // Given: 글이 존재하는 경우
      const user = await saveTestUser(userRepository);
      const post = await postRepository.save(
        postRepository.create({
          content: "hello world",
          category: PostCategory.DUMMY1,
          nickname: "testnick",
          author: user,
        }),
      );

      // When: 글 조회 시도
      const result = await postQueryService.getPost(user.id, post.id);

      // Then: 올바른 글 반환
      expect(result.entry.post).toMatchObject({
        id: post.id,
        content: "hello world",
        category: PostCategory.DUMMY1,
      });
    });

    describe("relation fields", () => {
      it("success: user가 owner -> isOwner true", async () => {
        // Given: 글 작성자
        const user = await saveTestUser(userRepository);
        const post = await saveTestPost(postRepository, user.id);

        // When: 글 조회 시도
        const result = await postQueryService.getPost(user.id, post.id);

        // Then: isOwner === true
        expect(result.entry.withUser.isOwner).toBe(true);
      });

      it("success: user가 owner 아님 -> isOwner false", async () => {
        // Given: 글 작성자와 다른 사용자
        const author = await saveTestUser(userRepository);
        const viewer = await saveTestUser(userRepository);
        const post = await saveTestPost(postRepository, author.id);

        // When: viewer로 글 조회 시도
        const result = await postQueryService.getPost(viewer.id, post.id);

        // Then: isOwner === false
        expect(result.entry.withUser.isOwner).toBe(false);
      });

      it("success: user가 like한 글 -> isLiked true", async () => {
        // Given: user가 like한 글
        const user = await saveTestUser(userRepository);
        const post = await saveTestPost(postRepository, user.id);
        await postLikeRepository.save(
          postLikeRepository.create({
            user: { id: user.id },
            post: { id: post.id },
          }),
        );

        // When: 글 조회 시도
        const result = await postQueryService.getPost(user.id, post.id);

        // Then: isLiked === true
        expect(result.entry.withUser.isLiked).toBe(true);
      });

      it("success: user가 like 하지 않은 글 -> isLiked false", async () => {
        // Given: user가 like하지 않은 글
        const user = await saveTestUser(userRepository);
        const post = await saveTestPost(postRepository, user.id);

        // When: 글 조회 시도
        const result = await postQueryService.getPost(user.id, post.id);

        // Then: isLiked === false
        expect(result.entry.withUser.isLiked).toBe(false);
      });
    });

    it("success: 올바른 attachments URL 맵 반환", async () => {
      // Given: attachment가 있는 글
      const user = await saveTestUser(userRepository);
      const post = await saveTestPost(postRepository, user.id);
      const attachment = await attachmentRepository.save(
        attachmentRepository.create({
          confirmed: true,
          s3Key: "attachments/test-key",
          index: 0,
          post,
        }),
      );

      // When: 글 조회 시도
      const result = await postQueryService.getPost(user.id, post.id);

      // Then: attachment URL 맵 올바르게 반환
      expect(result.attachmentToUrl[attachment.id]).toBe(
        fakeS3.getPublicUrl(attachment.s3Key),
      );
    });

    it("존재하지 않는 글 처리", async () => {
      // Given: 글이 존재하지 않는 경우
      const user = await saveTestUser(userRepository);
      const nonExistentId = 0;

      // When: 글 조회 시도
      const result = postQueryService.getPost(user.id, nonExistentId);

      // Then: throws handled error
      await expect(result).rejects.toThrow(PostNotFoundError);
    });
  });
});
