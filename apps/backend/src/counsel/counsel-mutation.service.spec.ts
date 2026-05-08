import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import PGMem from "pg-mem";
import { CounselMutationService } from "./counsel-mutation.service";
import {
  CounselNotFoundError,
  NotCounselAuthorError,
  CounselAlreadyRespondedError,
} from "./counsel.errors";
import { CounselEntry, CounselCategory } from "./entities/counsel-entry.entity";
import { User, UserRole } from "src/user/entities/user.entity";
import { initializePgMem } from "src/test/pg-mem.helper";
import { UserProfile } from "src/user/entities/user-profile.entity";

const entities = [User, UserProfile, CounselEntry];

describe("CounselMutationService", () => {
  let module: TestingModule;
  let counselMutationService: CounselMutationService;
  let counselEntryRepository: Repository<CounselEntry>;
  let userRepository: Repository<User>;
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

  async function saveTestCounsel(
    userId: number,
    overrides?: Partial<CounselEntry>,
  ): Promise<CounselEntry> {
    return counselEntryRepository.save(
      counselEntryRepository.create({
        authorId: userId,
        title: "test title",
        content: "test content",
        category: CounselCategory.ANXIETY,
        responseContent: null,
        responderId: null,
        ...overrides,
      }),
    );
  }

  beforeAll(async () => {
    const { dataSource: ds, backup } = await initializePgMem(entities);
    dataSource = ds;
    dbBackup = backup;

    module = await Test.createTestingModule({
      providers: [
        CounselMutationService,
        {
          provide: getRepositoryToken(CounselEntry),
          useValue: dataSource.getRepository(CounselEntry),
        },
      ],
    }).compile();

    counselMutationService = module.get(CounselMutationService);
    counselEntryRepository = dataSource.getRepository(CounselEntry);
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

  describe("createCounsel", () => {
    it("success: counsel entry 생성", async () => {
      // Given
      const user = await saveTestUser();

      // When: counsel entry 생성 시도
      const counsel = await counselMutationService.createCounselEntry({
        userId: user.id,
        title: "title",
        content: "content",
        category: CounselCategory.ANXIETY,
      });

      // Then: counsel entry가 올바르게 생성됨
      const saved = await counselEntryRepository.findOneBy({ id: counsel.id });
      expect(saved).toMatchObject({
        authorId: user.id,
        title: "title",
        content: "content",
        category: CounselCategory.ANXIETY,
        responseContent: null,
      });
    });
  });

  describe("updateCounsel", () => {
    it("success: counsel entry 업데이트", async () => {
      // Given: 존재하는 counsel entry 및 올바른 작성자인 경우
      const user = await saveTestUser();
      const counsel = await saveTestCounsel(user.id);

      // When: counsel entry 업데이트 시도
      await counselMutationService.updateCounselEntry({
        id: counsel.id,
        userId: user.id,
        title: "updated title",
        content: "updated content",
        category: CounselCategory.STRESS,
      });

      // Then: counsel entry 업데이트됨
      const updated = await counselEntryRepository.findOneBy({
        id: counsel.id,
      });
      expect(updated).toMatchObject({
        title: "updated title",
        content: "updated content",
        category: CounselCategory.STRESS,
      });
    });

    it("존재하지 않는 counsel entry 처리", async () => {
      // Given: counsel entry가 존재하지 않는 경우
      const user = await saveTestUser();
      const nonExistentId = 0;

      // When: counsel entry 업데이트 시도
      const result = counselMutationService.updateCounselEntry({
        id: nonExistentId,
        userId: user.id,
        title: "title",
        content: "content",
        category: CounselCategory.ANXIETY,
      });

      // Then: throws handled error
      await expect(result).rejects.toThrow(CounselNotFoundError);
    });

    it("counsel entry 작성자가 아닌 경우 처리", async () => {
      // Given: counsel entry가 존재하지만, 작성자가 일치하지 않는 경우
      const user = await saveTestUser();
      const otherUser = await saveTestUser();
      const counsel = await saveTestCounsel(otherUser.id);

      // When: counsel entry 업데이트 시도
      const result = counselMutationService.updateCounselEntry({
        id: counsel.id,
        userId: user.id,
        title: "title",
        content: "content",
        category: CounselCategory.ANXIETY,
      });

      // Then: throws handled error
      await expect(result).rejects.toThrow(NotCounselAuthorError);
    });
  });

  describe("deleteCounsel", () => {
    it("success: counsel entry 삭제", async () => {
      // Given: 존재하는 counsel entry 및 작성자인 경우
      const user = await saveTestUser();
      const counsel = await saveTestCounsel(user.id);

      // When: counsel entry 삭제 시도
      await counselMutationService.deleteCounselEntry(counsel.id, user.id);

      // Then: counsel entry 삭제됨
      expect(
        await counselEntryRepository.findOneBy({ id: counsel.id }),
      ).toBeNull();
    });

    it("존재하지 않는 counsel entry 처리", async () => {
      // Given: counsel entry가 존재하지 않는 경우
      const user = await saveTestUser();
      const nonExistentId = 0;

      // When: counsel entry 삭제 시도
      const result = counselMutationService.deleteCounselEntry(
        nonExistentId,
        user.id,
      );

      // Then: throws handled error
      await expect(result).rejects.toThrow(CounselNotFoundError);
    });

    it("counsel entry 작성자가 아닌 경우 처리", async () => {
      // Given: counsel entry가 존재하지만, 작성자가 일치하지 않는 경우
      const user = await saveTestUser();
      const otherUser = await saveTestUser();
      const counsel = await saveTestCounsel(otherUser.id);

      // When: counsel entry 삭제 시도
      const result = counselMutationService.deleteCounselEntry(
        counsel.id,
        user.id,
      );

      // Then: throws handled error
      await expect(result).rejects.toThrow(NotCounselAuthorError);
    });
  });

  describe("respondToCounsel", () => {
    it("success: counsel entry 답변 등록", async () => {
      // Given: 존재하는 counsel entry이며, 답변이 없는 경우
      const author = await saveTestUser();
      const admin = await saveTestUser({ role: UserRole.ADMIN });
      const counsel = await saveTestCounsel(author.id);

      // When: counsel entry 답변 시도
      await counselMutationService.respondToCounselEntry(
        counsel.id,
        admin.id,
        "response content",
      );

      // Then: responseContent 및 responderId 업데이트됨
      const responded = await counselEntryRepository.findOneBy({
        id: counsel.id,
      });
      expect(responded).toMatchObject({
        responderId: admin.id,
        responseContent: "response content",
      });
    });

    it("존재하지 않는 counsel entry 처리", async () => {
      // Given: counsel entry가 존재하지 않는 경우
      const admin = await saveTestUser({ role: UserRole.ADMIN });
      const nonExistentId = 0;

      // When: counsel entry 답변 시도
      const result = counselMutationService.respondToCounselEntry(
        nonExistentId,
        admin.id,
        "response content",
      );

      // Then: throws handled error
      await expect(result).rejects.toThrow(CounselNotFoundError);
    });

    it("이미 답변된 counsel entry 처리", async () => {
      // Given: counsel entry가 이미 답변된 경우
      const author = await saveTestUser();
      const admin = await saveTestUser({ role: UserRole.ADMIN });
      const counsel = await saveTestCounsel(author.id, {
        responderId: admin.id,
        responseContent: "existing response",
      });

      // When: counsel entry 답변 시도
      const result = counselMutationService.respondToCounselEntry(
        counsel.id,
        admin.id,
        "new response",
      );

      // Then: throws handled error
      await expect(result).rejects.toThrow(CounselAlreadyRespondedError);
    });
  });
});
