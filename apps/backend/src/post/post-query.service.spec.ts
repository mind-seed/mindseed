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
import {
  DeletionType,
  PostComment,
} from "src/comment/entities/post-comment.entity";
import { Temporal } from "@js-temporal/polyfill";
import { Report } from "src/report/entities/report.entity";

const entities = [
  UserProfile,
  User,
  PostComment,
  Post,
  PostLike,
  Attachment,
  Report,
];

describe("PostQueryService", () => {
  let module: TestingModule;
  let postQueryService: PostQueryService;
  let postRepository: Repository<Post>;
  let postLikeRepository: Repository<PostLike>;
  let attachmentRepository: Repository<Attachment>;
  let commentRepository: Repository<PostComment>;
  let userRepository: Repository<User>;
  let fakeS3: FakeS3StorageService;
  let dataSource: DataSource;
  let dbBackup: PGMem.IBackup;

  let userCounter = 0;

  async function saveTestUser(overrides?: Partial<User>): Promise<User> {
    return userRepository.save(
      userRepository.create({
        email: `user${++userCounter}@test.com`,
        password: "password",
        role: UserRole.USER,
        ...overrides,
      }),
    );
  }

  async function saveTestPost(
    userId: number,
    overrides?: Partial<Post>,
  ): Promise<Post> {
    return postRepository.save(
      postRepository.create({
        content: "test content",
        category: PostCategory.DUMMY1,
        nickname: "testnick",
        author: { id: userId } as User,
        ...overrides,
      }),
    );
  }

  async function saveTestPosts(
    userId: number,
    overridesList: Partial<Post>[],
  ): Promise<number[]> {
    const ids: number[] = [];
    for (const overrides of overridesList) {
      ids.push((await saveTestPost(userId, overrides)).id);
    }
    return ids;
  }

  async function saveTestComment(
    postId: number,
    userId: number,
    overrides?: Partial<PostComment>,
  ): Promise<PostComment> {
    return commentRepository.save(
      commentRepository.create({
        nickname: "testnick",
        content: "test comment",
        post: { id: postId } as Post,
        author: { id: userId } as User,
        deletedAt: null,
        deletionType: null,
        ...overrides,
      }),
    );
  }

  let reportRepository: Repository<Report>;

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
        {
          provide: getRepositoryToken(Report),
          useValue: dataSource.getRepository(Report),
        },
      ],
    }).compile();

    postQueryService = module.get(PostQueryService);
    postRepository = dataSource.getRepository(Post);
    postLikeRepository = dataSource.getRepository(PostLike);
    attachmentRepository = dataSource.getRepository(Attachment);
    commentRepository = dataSource.getRepository(PostComment);
    userRepository = dataSource.getRepository(User);
    reportRepository = dataSource.getRepository(Report);
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
        const user = await saveTestUser();
        const ids = await saveTestPosts(user.id, [
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
        const user = await saveTestUser();
        const ids = await saveTestPosts(user.id, [{}, {}, {}]);

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

      it("올바르지 않은 형식의 cursor인 경우 처리", async () => {
        // Given: 올바르지 않은 형식의 cursor
        const user = await saveTestUser();
        const malformedCursor = "arst";

        // When: 글 목록 조회 시도
        const result = postQueryService.listPosts(user.id, {
          limit: 1,
          orderBy: "createdAt",
          orderDirection: "asc",
          cursor: malformedCursor,
        });

        // Then: throws handled error
        await expect(result).rejects.toThrow(InvalidCursorError);
      });
    });

    describe("relation fields", () => {
      it("success: user가 owner -> isOwner true", async () => {
        // Given: 사용자 및 글 (테스트를 위해 단일로만 저장)
        const user = await saveTestUser();
        await saveTestPost(user.id);

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
        const author = await saveTestUser();
        const viewer = await saveTestUser();
        await saveTestPost(author.id);

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
        const user = await saveTestUser();
        const post = await saveTestPost(user.id);
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
        const user = await saveTestUser();
        await saveTestPost(user.id);

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

    describe("탈퇴한 author 처리", () => {
      it("soft-deleted author의 글 제외 처리", async () => {
        // Given
        const user = await saveTestUser();
        const deletedUser = await saveTestUser();
        const activePost = await saveTestPost(user.id);
        await saveTestPost(deletedUser.id);
        await userRepository.softDelete({ id: deletedUser.id });

        // When: 글 목록 조회 시도
        const result = await postQueryService.listPosts(user.id, {
          limit: 10,
          orderBy: "createdAt",
          orderDirection: "asc",
        });

        // Then: 탈퇴한 author 글 제외
        expect(result.items.map((p) => p.post.id)).toEqual([activePost.id]);
      });
    });

    describe("신고한 글 필터링", () => {
      it("신고한 글은 목록에서 제외", async () => {
        // Given: 사용자가 특정 글을 신고한 경우
        const user = await saveTestUser();
        const [post1, post2] = await saveTestPosts(user.id, [{}, {}]);
        await reportRepository.save(
          reportRepository.create({
            reason: "부적절한 내용",
            post: { id: post1 },
            user: { id: user.id },
          }),
        );

        // When: 글 목록 조회 시도
        const result = await postQueryService.listPosts(user.id, {
          limit: 10,
          orderBy: "createdAt",
          orderDirection: "asc",
        });

        // Then: 신고한 글 제외
        expect(result.items.map((p) => p.post.id)).toEqual([post2]);
      });

      it("다른 사용자가 신고한 글은 그대로 노출", async () => {
        // Given: 다른 사용자가 특정 글을 신고한 경우
        const user = await saveTestUser();
        const otherUser = await saveTestUser();
        const [post1, post2] = await saveTestPosts(user.id, [{}, {}]);
        await reportRepository.save(
          reportRepository.create({
            reason: "부적절한 내용",
            post: { id: post1 },
            user: { id: otherUser.id },
          }),
        );

        // When: user로 글 목록 조회 시도
        const result = await postQueryService.listPosts(user.id, {
          limit: 10,
          orderBy: "createdAt",
          orderDirection: "asc",
        });

        // Then: 모든 글 노출
        expect(result.items.map((p) => p.post.id)).toEqual([post1, post2]);
      });

      it("신고 후 페이지네이션 커서 정상 동작", async () => {
        // Given: 여러 글 중 일부 신고
        const user = await saveTestUser();
        const ids = await saveTestPosts(user.id, [{}, {}, {}, {}, {}]);
        // 가운데 글들 신고
        await reportRepository.save(
          reportRepository.create({
            reason: "신고",
            post: { id: ids[1] },
            user: { id: user.id },
          }),
        );
        await reportRepository.save(
          reportRepository.create({
            reason: "신고",
            post: { id: ids[3] },
            user: { id: user.id },
          }),
        );

        // When: limit=2로 1페이지 조회
        const page1 = await postQueryService.listPosts(user.id, {
          limit: 2,
          orderBy: "createdAt",
          orderDirection: "asc",
        });

        // Then: 신고된 글 제외, limit만큼 정상 반환
        expect(page1.items.map((p) => p.post.id)).toEqual([ids[0], ids[2]]);
        expect(page1.nextCursor).toBeDefined();

        // When: 2페이지 조회
        const page2 = await postQueryService.listPosts(user.id, {
          cursor: page1.nextCursor,
          limit: 2,
          orderBy: "createdAt",
          orderDirection: "asc",
        });

        // Then: 나머지 글 정상 반환
        expect(page2.items.map((p) => p.post.id)).toEqual([ids[4]]);
        expect(page2.nextCursor).toBeUndefined();
      });
    });

    it("success: 올바른 attachments URL 맵 반환", async () => {
      // Given: attachment가 있는 글
      const user = await saveTestUser();
      const post = await saveTestPost(user.id);
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
      const user = await saveTestUser();
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
      expect(result.post).toMatchObject({
        id: post.id,
        content: "hello world",
        category: PostCategory.DUMMY1,
      });
    });

    describe("relation fields", () => {
      it("success: user가 owner -> isOwner true", async () => {
        // Given: 글 작성자
        const user = await saveTestUser();
        const post = await saveTestPost(user.id);

        // When: 글 조회 시도
        const result = await postQueryService.getPost(user.id, post.id);

        // Then: isOwner === true
        expect(result.withUser.isOwner).toBe(true);
      });

      it("success: user가 owner 아님 -> isOwner false", async () => {
        // Given: 글 작성자와 다른 사용자
        const author = await saveTestUser();
        const viewer = await saveTestUser();
        const post = await saveTestPost(author.id);

        // When: viewer로 글 조회 시도
        const result = await postQueryService.getPost(viewer.id, post.id);

        // Then: isOwner === false
        expect(result.withUser.isOwner).toBe(false);
      });

      it("success: user가 like한 글 -> isLiked true", async () => {
        // Given: user가 like한 글
        const user = await saveTestUser();
        const post = await saveTestPost(user.id);
        await postLikeRepository.save(
          postLikeRepository.create({
            user: { id: user.id },
            post: { id: post.id },
          }),
        );

        // When: 글 조회 시도
        const result = await postQueryService.getPost(user.id, post.id);

        // Then: isLiked === true
        expect(result.withUser.isLiked).toBe(true);
      });

      it("success: user가 like 하지 않은 글 -> isLiked false", async () => {
        // Given: user가 like하지 않은 글
        const user = await saveTestUser();
        const post = await saveTestPost(user.id);

        // When: 글 조회 시도
        const result = await postQueryService.getPost(user.id, post.id);

        // Then: isLiked === false
        expect(result.withUser.isLiked).toBe(false);
      });
    });

    it("success: 올바른 attachments URL 맵 반환", async () => {
      // Given: attachment가 있는 글
      const user = await saveTestUser();
      const post = await saveTestPost(user.id);
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

    describe("comments", () => {
      it("success: active comment -> type active", async () => {
        // Given: 일반 댓글
        const user = await saveTestUser();
        const post = await saveTestPost(user.id);
        const comment = await saveTestComment(post.id, user.id);

        // When: 글 조회 시도
        const result = await postQueryService.getPost(user.id, post.id);

        // Then: active type의 댓글
        expect(result.comments).toHaveLength(1);
        expect(result.comments[0].comment.id).toBe(comment.id);
        expect(result.comments[0].type).toBe("active");
      });

      it("success: author가 삭제한 comment -> type deleted", async () => {
        // Given: author가 삭제한 댓글
        const user = await saveTestUser();
        const post = await saveTestPost(user.id);
        await saveTestComment(post.id, user.id, {
          deletedAt: Temporal.Now.instant(),
          deletionType: DeletionType.AUTHOR,
        });

        // When: 글 조회 시도
        const result = await postQueryService.getPost(user.id, post.id);

        // Then: deleted type의 댓글
        expect(result.comments[0].type).toBe("deleted");
      });

      it("success: admin이 삭제한 comment -> type deleted", async () => {
        // Given: admin이 삭제한 댓글
        const user = await saveTestUser();
        const post = await saveTestPost(user.id);
        await saveTestComment(post.id, user.id, {
          deletedAt: Temporal.Now.instant(),
          deletionType: DeletionType.ADMIN,
        });

        // When: 글 조회 시도
        const result = await postQueryService.getPost(user.id, post.id);

        // Then: deleted type의 댓글
        expect(result.comments[0].type).toBe("deleted");
      });

      it("success: soft-deleted author의 comment -> type authorDeleted", async () => {
        // Given: 탈퇴된 author의 댓글
        const author = await saveTestUser();
        const user = await saveTestUser();
        const post = await saveTestPost(user.id);
        await saveTestComment(post.id, author.id);
        await userRepository.softDelete({ id: author.id });

        // When: 글 조회 시도
        const result = await postQueryService.getPost(user.id, post.id);

        // Then: authorDeleted type의 댓글
        expect(result.comments[0].type).toBe("authorDeleted");
      });

      it("success: hard-deleted author의 comment -> type authorDeleted", async () => {
        // Given: authorId null인 댓글
        const user = await saveTestUser();
        const post = await saveTestPost(user.id);
        const comment = await saveTestComment(post.id, user.id);
        await commentRepository.update({ id: comment.id }, { authorId: null });

        // When: 글 조회 시도
        const result = await postQueryService.getPost(user.id, post.id);

        // Then: authorDeleted type의 댓글
        expect(result.comments[0].type).toBe("authorDeleted");
      });
    });

    describe("탈퇴한 author 처리", () => {
      it("soft-deleted author의 글 조회 시 PostNotFoundError", async () => {
        // Given: soft-deleted author의 글
        const author = await saveTestUser();
        const viewer = await saveTestUser();
        const post = await saveTestPost(author.id);
        await userRepository.softDelete({ id: author.id });

        // When: 글 조회 시도
        const result = postQueryService.getPost(viewer.id, post.id);

        // Then: throws handled error
        await expect(result).rejects.toThrow(PostNotFoundError);
      });
    });

    it("존재하지 않는 글 처리", async () => {
      // Given: 글이 존재하지 않는 경우
      const user = await saveTestUser();
      const nonExistentId = 0;

      // When: 글 조회 시도
      const result = postQueryService.getPost(user.id, nonExistentId);

      // Then: throws handled error
      await expect(result).rejects.toThrow(PostNotFoundError);
    });
  });
});
