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
import { Attachment } from "src/attachment/entities/attachment.entity";
import { PostComment } from "src/comment/entities/post-comment.entity";
import { initializePgMem } from "src/test/pg-mem.helper";

const entities = [User, UserProfile, Post, Attachment, PostComment, Report];

describe("ReportService", () => {
  let module: TestingModule;
  let reportService: ReportService;
  let reportRepository: Repository<Report>;
  let postRepository: Repository<Post>;
  let userRepository: Repository<User>;
  let dataSource: DataSource;
  let dbBackup: PGMem.IBackup;
  let postQueryService: jest.Mocked<PostQueryService>;

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

  beforeAll(async () => {
    const { dataSource: ds, backup } = await initializePgMem(entities);
    dataSource = ds;
    dbBackup = backup;

    postQueryService = {
      existsPost: jest.fn(),
    } as unknown as jest.Mocked<PostQueryService>;

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
      ],
    }).compile();

    reportService = module.get(ReportService);
    reportRepository = dataSource.getRepository(Report);
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

  describe("createReport", () => {
    it("success: 신고 생성", async () => {
      // Given: 글이 존재하는 경우
      const user = await saveTestUser();
      const post = await saveTestPost(user.id);
      postQueryService.existsPost.mockResolvedValue(true);

      // When: 신고 생성 시도
      const report = await reportService.createReport(
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
      const result = reportService.createReport(
        user.id,
        nonExistentPostId,
        "사유",
      );

      // Then: throws handled error
      await expect(result).rejects.toThrow(PostNotFoundError);
    });
  });
});
