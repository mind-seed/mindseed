import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import PGMem from "pg-mem";
import { PostQueryService } from "./post-query.service";
import { InvalidCursorError, PostNotFoundError } from "./post.errors";
import { Post, PostCategory } from "./post.entity";
import { PostLike } from "./post-like.entity";
import { Attachment } from "../attachment/attachment.entity";
import { User, UserRole } from "../user/user.entity";
import { UserProfile } from "../user/user-profile.entity";
import { initializePgMem } from "src/test/pg-mem.helper";

const entities = [UserProfile, User, Post, PostLike, Attachment];

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

describe("PostQueryService", () => {
  let module: TestingModule;
  let postQueryService: PostQueryService;
  let postRepository: Repository<Post>;
  let userRepository: Repository<User>;
  let dataSource: DataSource;
  let dbBackup: PGMem.IBackup;

  beforeAll(async () => {
    const { dataSource: ds, backup } = await initializePgMem(entities);
    dataSource = ds;
    dbBackup = backup;

    module = await Test.createTestingModule({
      providers: [
        PostQueryService,
        {
          provide: getRepositoryToken(Post),
          useValue: dataSource.getRepository(Post),
        },
      ],
    }).compile();

    postQueryService = module.get(PostQueryService);
    postRepository = dataSource.getRepository(Post);
    userRepository = dataSource.getRepository(User);
  });

  beforeEach(() => {
    dbBackup.restore();
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  describe("listPosts", () => {
    // 2026-03-23: success 처리를 parameter의 조합별로 더 테스트하는 것이 더
    // 엄밀하지만, 현재는 그럴 필요가 없다고 판단하여 success 케이스 하나만
    // 처리합니다.
    it("success: 각 parameter 처리", async () => {
      // Given: posts
      const user = await saveTestUser(userRepository);
      const p1 = await saveTestPost(postRepository, user.id, {
        category: PostCategory.DUMMY1,
      });
      const p2 = await saveTestPost(postRepository, user.id, {
        category: PostCategory.DUMMY1,
      });
      const p3 = await saveTestPost(postRepository, user.id, {
        category: PostCategory.DUMMY1,
      });
      await saveTestPost(postRepository, user.id, {
        category: PostCategory.DUMMY2,
      });

      // When: 글 조회 시도
      const result = await postQueryService.listPosts({
        limit: 2,
        category: PostCategory.DUMMY1,
        orderBy: "createdAt",
        orderDirection: "asc",
      });

      // Then: 올바른 결과 반환
      expect(result.posts.map((p) => p.id)).toEqual([p1.id, p2.id]);
      expect(result.nextCursor).toBeDefined();

      // When: nextCursor로 글 조회 시도
      const result2 = await postQueryService.listPosts({
        cursor: result.nextCursor,
        limit: 2,
        category: PostCategory.DUMMY1,
        orderBy: "createdAt",
        orderDirection: "asc",
      });

      // Then: 올바른 결과 반환
      expect(result2.posts.map((p) => p.id)).toEqual([p3.id]);
      expect(result2.nextCursor).toBeUndefined();
    });

    it("success: cursor에 해당하는 글이 삭제된 경우 올바르게 처리", async () => {
      // Given: cursor에 해당하는 글이 삭제된 경우
      const user = await saveTestUser(userRepository);
      const p1 = await saveTestPost(postRepository, user.id);
      const p2 = await saveTestPost(postRepository, user.id);
      const p3 = await saveTestPost(postRepository, user.id);

      const firstPage = await postQueryService.listPosts({
        limit: 1,
        orderBy: "createdAt",
        orderDirection: "asc",
      });
      await postRepository.delete(p1.id);

      // When: 글 조회 시도
      const result = await postQueryService.listPosts({
        cursor: firstPage.nextCursor,
        limit: 2,
        orderBy: "createdAt",
        orderDirection: "asc",
      });

      // Then: 삭제된 글 다음부터 올바르게 반환
      expect(result.posts.map((p) => p.id)).toEqual([p2.id, p3.id]);
    });

    it("category 및 orderBy와 벗어난 cursor 처리", async () => {
      // Given: cursor가 category 및 orderBy를 다르게 하여 조회했을 때의
      // 결과물인 경우
      const user = await saveTestUser(userRepository);
      await saveTestPost(postRepository, user.id, {
        category: PostCategory.DUMMY1,
      });
      await saveTestPost(postRepository, user.id, {
        category: PostCategory.DUMMY1,
      });
      const firstPage = await postQueryService.listPosts({
        limit: 1,
        orderBy: "createdAt",
        orderDirection: "asc",
        category: PostCategory.DUMMY1,
      });

      // When: 글 조회 시도
      const result = postQueryService.listPosts({
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

  describe("getPost", () => {
    it("success: 올바른 글 반환", async () => {
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
      const result = await postQueryService.getPost(post.id);

      // Then: 올바른 글 반환
      expect(result).toMatchObject({
        id: post.id,
        content: "hello world",
        category: PostCategory.DUMMY1,
      });
    });

    it("존재하지 않는 글 처리", async () => {
      // Given: 글이 존재하지 않는 경우

      // When: 글 조회 시도
      const result = postQueryService.getPost(0);

      // Then: throws handled error
      await expect(result).rejects.toThrow(PostNotFoundError);
    });
  });
});
