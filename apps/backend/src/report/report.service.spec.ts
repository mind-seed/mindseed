import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import PGMem from "pg-mem";
import { ReportService } from "./report.service";
import { Report } from "./entities/report.entity";
import { Post, PostCategory } from "src/post/entities/post.entity";
import { User, UserRole } from "src/user/entities/user.entity";
import { UserProfile } from "src/user/entities/user-profile.entity";
import { PostQueryService } from "src/post/post-query.service";
import { PostNotFoundError } from "src/post/post.errors";
import { CommentNotFoundError } from "src/comment/comment.errors";
import { CommentService } from "src/comment/comment.service";
import { ReportReasonEmptyError } from "./report.errors";
import { Attachment } from "src/attachment/entities/attachment.entity";
import { PostComment } from "src/comment/entities/post-comment.entity";
import { initializePgMem } from "src/test/pg-mem.helper";

const entities = [User, UserProfile, Post, Attachment, PostComment, Report];

describe("ReportService", () => {
  let module: TestingModule;
  let reportService: ReportService;
  let reportRepository: Repository<Report>;
  let postRepository: Repository<Post>;
  let commentRepository: Repository<PostComment>;
  let userRepository: Repository<User>;
  let dataSource: DataSource;
  let dbBackup: PGMem.IBackup;
  let postQueryService: jest.Mocked<PostQueryService>;
  let commentService: jest.Mocked<CommentService>;

  let userCounter = 0;

  async function saveTestUser(overrides?: Partial<User>): Promise<User> {
    return userRepository.save(
      userRepository.create({
        email: `report-test${++userCounter}@test.com`,
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

  async function saveTestComment(
    postId: number,
    authorId: number,
    overrides?: Partial<PostComment>,
  ): Promise<PostComment> {
    return commentRepository.save(
      commentRepository.create({
        content: "test comment",
        nickname: "testnick",
        post: { id: postId } as Post,
        author: { id: authorId } as User,
        deletedAt: null,
        deletedBy: null,
        deletionType: null,
        ...overrides,
      }),
    );
  }

  beforeAll(async () => {
    const { dataSource: ds, backup } = await initializePgMem(entities);
    dataSource = ds;
    dbBackup = backup;

    postQueryService = {
      existsPost: jest.fn(),
    } as unknown as jest.Mocked<PostQueryService>;

    commentService = {
      existsComment: jest.fn(),
    } as unknown as jest.Mocked<CommentService>;

    module = await Test.createTestingModule({
      providers: [
        ReportService,
        {
          provide: getRepositoryToken(Report),
          useValue: dataSource.getRepository(Report),
        },
        {
          provide: PostQueryService,
          useValue: postQueryService,
        },
        {
          provide: CommentService,
          useValue: commentService,
        },
      ],
    }).compile();

    reportService = module.get(ReportService);
    reportRepository = dataSource.getRepository(Report);
    postRepository = dataSource.getRepository(Post);
    commentRepository = dataSource.getRepository(PostComment);
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

  describe("createPostReport", () => {
    it("success: 신고 생성", async () => {
      // Given: 글이 존재하는 경우
      const user = await saveTestUser();
      const post = await saveTestPost(user.id);
      postQueryService.existsPost.mockResolvedValue(true);

      // When: 신고 생성 시도
      const report = await reportService.createPostReport(
        user.id,
        post.id,
        "부적절한 내용",
      );

      // Then: 신고 저장
      const saved = await reportRepository.findOneBy({ id: report.id });
      expect(saved).toMatchObject({
        reason: "부적절한 내용",
      });
      expect(saved).not.toBeNull();
    });

    it("존재하지 않는 글 처리", async () => {
      // Given: 글이 존재하지 않는 경우
      const user = await saveTestUser();
      const nonExistentPostId = 0;
      postQueryService.existsPost.mockResolvedValue(false);

      // When: 신고 생성 시도
      const result = reportService.createPostReport(
        user.id,
        nonExistentPostId,
        "사유",
      );

      // Then: throws handled error
      await expect(result).rejects.toThrow(PostNotFoundError);
    });

    it("빈 사유로 신고 시 예외 발생", async () => {
      // Given: 글이 존재하는 경우
      const user = await saveTestUser();
      const post = await saveTestPost(user.id);
      postQueryService.existsPost.mockResolvedValue(true);

      // When: 빈 사유로 신고 생성 시도
      const result = reportService.createPostReport(user.id, post.id, "");

      // Then: 예외 발생
      await expect(result).rejects.toThrow(ReportReasonEmptyError);
    });

    it("공백 사유로 신고 시 예외 발생", async () => {
      // Given: 글이 존재하는 경우
      const user = await saveTestUser();
      const post = await saveTestPost(user.id);
      postQueryService.existsPost.mockResolvedValue(true);

      // When: 공백 사유로 신고 생성 시도
      const result = reportService.createPostReport(user.id, post.id, "   ");

      // Then: 예외 발생
      await expect(result).rejects.toThrow(ReportReasonEmptyError);
    });
  });

  describe("createCommentReport", () => {
    it("success: 댓글 신고 생성", async () => {
      // Given: 댓글이 존재하는 경우
      const user = await saveTestUser();
      const post = await saveTestPost(user.id);
      const comment = await saveTestComment(post.id, user.id);
      commentService.existsComment.mockResolvedValue(true);

      // When: 신고 생성 시도
      const report = await reportService.createCommentReport(
        user.id,
        comment.id,
        "부적절한 댓글",
      );

      // Then: 신고 저장 확인
      const saved = await reportRepository.findOneBy({ id: report.id });
      expect(saved).toMatchObject({
        reason: "부적절한 댓글",
        range: "COMMENT",
      });
      expect(saved).not.toBeNull();
    });

    it("존재하지 않는 댓글 처리", async () => {
      // Given: 댓글이 존재하지 않는 경우
      const user = await saveTestUser();
      const nonExistentCommentId = 0;
      commentService.existsComment.mockResolvedValue(false);

      // When: 신고 생성 시도
      const result = reportService.createCommentReport(
        user.id,
        nonExistentCommentId,
        "사유",
      );

      // Then: throws handled error
      await expect(result).rejects.toThrow(CommentNotFoundError);
    });

    it("빈 사유로 댓글 신고 시 예외 발생", async () => {
      // Given: 댓글이 존재하는 경우
      const user = await saveTestUser();
      const post = await saveTestPost(user.id);
      const comment = await saveTestComment(post.id, user.id);
      commentService.existsComment.mockResolvedValue(true);

      // When: 빈 사유로 신고 생성 시도
      const result = reportService.createCommentReport(user.id, comment.id, "");

      // Then: 예외 발생
      await expect(result).rejects.toThrow(ReportReasonEmptyError);
    });

    it("공백 사유로 댓글 신고 시 예외 발생", async () => {
      // Given: 댓글이 존재하는 경우
      const user = await saveTestUser();
      const post = await saveTestPost(user.id);
      const comment = await saveTestComment(post.id, user.id);
      commentService.existsComment.mockResolvedValue(true);

      // When: 공백 사유로 신고 생성 시도
      const result = reportService.createCommentReport(
        user.id,
        comment.id,
        "   ",
      );

      // Then: 예외 발생
      await expect(result).rejects.toThrow(ReportReasonEmptyError);
    });
  });
});
