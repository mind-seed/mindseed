import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import PGMem from "pg-mem";
import { CounselQueryService } from "./counsel-query.service";
import { CounselNotFoundError } from "./counsel.errors";
import { InvalidCursorError } from "src/common/errors/pagination.errors";
import { CounselEntry, CounselCategory } from "./entities/counsel-entry.entity";
import { User, UserRole } from "src/user/entities/user.entity";
import { UserProfile } from "src/user/entities/user-profile.entity";
import { initializePgMem } from "src/test/pg-mem.helper";

const entities = [User, UserProfile, CounselEntry];

describe("CounselQueryService", () => {
  let module: TestingModule;
  let counselQueryService: CounselQueryService;
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

  async function saveTestCounsels(
    userId: number,
    overridesList: Partial<CounselEntry>[],
  ): Promise<number[]> {
    const ids: number[] = [];
    for (const overrides of overridesList) {
      ids.push((await saveTestCounsel(userId, overrides)).id);
    }
    return ids;
  }

  beforeAll(async () => {
    const { dataSource: ds, backup } = await initializePgMem(entities);
    dataSource = ds;
    dbBackup = backup;

    module = await Test.createTestingModule({
      providers: [
        CounselQueryService,
        {
          provide: getRepositoryToken(CounselEntry),
          useValue: dataSource.getRepository(CounselEntry),
        },
      ],
    }).compile();

    counselQueryService = module.get(CounselQueryService);
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

  describe("listCounselEntriesWithOffset", () => {
    it("success: 각 parameter 처리", async () => {
      // Given
      const user = await saveTestUser();
      const admin = await saveTestUser({ role: UserRole.ADMIN });
      const ids = await saveTestCounsels(user.id, [
        {
          category: CounselCategory.ANXIETY,
          responseContent: null,
          responderId: null,
        },
        {
          category: CounselCategory.STRESS,
          responseContent: null,
          responderId: null,
        },
        {
          category: CounselCategory.ANXIETY,
          responseContent: null,
          responderId: null,
        },
        {
          category: CounselCategory.ANXIETY,
          responseContent: "response",
          responderId: admin.id,
        },
        {
          category: CounselCategory.ANXIETY,
          responseContent: null,
          responderId: null,
        },
      ]);

      // When: 첫 페이지 조회
      const result = await counselQueryService.listCounselEntriesWithOffset({
        offset: 0,
        limit: 2,
        category: CounselCategory.ANXIETY,
        responded: false,
        orderBy: "createdAt",
        orderDirection: "asc",
      });

      // Then: 올바른 결과 반환
      expect(result.items.map((e) => e.id)).toEqual([ids[0], ids[2]]);
      expect(result.hasNext).toBe(true);

      // When: 다음 페이지 조회
      const result2 = await counselQueryService.listCounselEntriesWithOffset({
        offset: 2,
        limit: 2,
        category: CounselCategory.ANXIETY,
        responded: false,
        orderBy: "createdAt",
        orderDirection: "asc",
      });

      // Then: 올바른 결과 반환
      expect(result2.items.map((e) => e.id)).toEqual([ids[4]]);
      expect(result2.hasNext).toBe(false);
    });
  });

  describe("listCounselEntriesWithCursor", () => {
    it("success: 각 parameter 처리", async () => {
      // Given
      const user = await saveTestUser();
      const admin = await saveTestUser({ role: UserRole.ADMIN });
      const ids = await saveTestCounsels(user.id, [
        {
          category: CounselCategory.ANXIETY,
          responseContent: null,
          responderId: null,
        },
        {
          category: CounselCategory.STRESS,
          responseContent: null,
          responderId: null,
        },
        {
          category: CounselCategory.ANXIETY,
          responseContent: null,
          responderId: null,
        },
        {
          category: CounselCategory.ANXIETY,
          responseContent: "response",
          responderId: admin.id,
        },
        {
          category: CounselCategory.ANXIETY,
          responseContent: null,
          responderId: null,
        },
      ]);

      // When: 첫 페이지 조회
      const result1 = await counselQueryService.listCounselEntriesWithCursor({
        limit: 2,
        category: CounselCategory.ANXIETY,
        responded: false,
        orderBy: "createdAt",
        orderDirection: "asc",
      });

      // Then: 올바른 결과 반환
      expect(result1.items.map((e) => e.id)).toEqual([ids[0], ids[2]]);
      expect(result1.nextCursor).toBeDefined();

      // When: 다음 페이지 조회
      const result2 = await counselQueryService.listCounselEntriesWithCursor({
        cursor: result1.nextCursor,
        limit: 2,
        category: CounselCategory.ANXIETY,
        responded: false,
        orderBy: "createdAt",
        orderDirection: "asc",
      });

      // Then: 올바른 결과 반환
      expect(result2.items.map((e) => e.id)).toEqual([ids[4]]);
      expect(result2.nextCursor).toBeUndefined();
    });

    it("success: cursor에 해당하는 counsel entry가 삭제된 경우 올바르게 처리", async () => {
      // Given: cursor에 해당하는 counsel entry가 삭제된 경우
      const user = await saveTestUser();
      const ids = await saveTestCounsels(user.id, [{}, {}, {}]);

      const firstPage = await counselQueryService.listCounselEntriesWithCursor({
        limit: 1,
        orderBy: "createdAt",
        orderDirection: "asc",
      });
      await counselEntryRepository.delete(ids[0]);

      // When: 조회 시도
      const result = await counselQueryService.listCounselEntriesWithCursor({
        cursor: firstPage.nextCursor,
        limit: 2,
        orderBy: "createdAt",
        orderDirection: "asc",
      });

      // Then: 삭제된 counsel entry 다음부터 올바르게 반환
      expect(result.items.map((e) => e.id)).toEqual([ids[1], ids[2]]);
    });

    it("올바르지 않은 형식의 cursor인 경우 처리", async () => {
      // Given: 올바르지 않은 형식의 cursor
      const malformedCursor = "arst";

      // When: 조회 시도
      const result = counselQueryService.listCounselEntriesWithCursor({
        cursor: malformedCursor,
        limit: 1,
        orderBy: "createdAt",
        orderDirection: "asc",
      });

      // Then: throws handled error
      expect(result).rejects.toThrow(InvalidCursorError);
    });
  });

  describe("getCounselEntry", () => {
    it("success: counsel entry 반환", async () => {
      // Given: 존재하는 counsel entry
      const user = await saveTestUser();
      const counsel = await saveTestCounsel(user.id, {
        title: "hello",
        content: "world",
        category: CounselCategory.STRESS,
      });

      // When: counsel entry 조회 시도
      const result = await counselQueryService.getCounselEntry(counsel.id);

      // Then: 올바른 counsel entry 반환
      expect(result).toMatchObject({
        id: counsel.id,
        title: "hello",
        content: "world",
        category: CounselCategory.STRESS,
      });
    });

    it("존재하지 않는 counsel entry 처리", async () => {
      // Given: counsel entry가 존재하지 않는 경우
      const nonExistentId = 0;

      // When: counsel entry 조회 시도
      const result = counselQueryService.getCounselEntry(nonExistentId);

      // Then: throws handled error
      await expect(result).rejects.toThrow(CounselNotFoundError);
    });
  });
});
