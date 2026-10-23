import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { HttpStatus } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import PGMem from "pg-mem";
import { DiagnosisErrorCode } from "@mindseed/api-types";
import { DiagnosisService } from "./diagnosis.service";
import { DiagnosisNotFoundError } from "./diagnosis.errors";
import { DiagnosisEntry } from "./entities/diagnosis-entry.entity";
import { User, UserRole } from "src/user/entities/user.entity";
import { UserProfile } from "src/user/entities/user-profile.entity";
import { initializePgMem } from "src/test/pg-mem.helper";

const entities = [User, UserProfile, DiagnosisEntry];

describe("DiagnosisService", () => {
  let module: TestingModule;
  let diagnosisService: DiagnosisService;
  let diagnosisEntryRepository: Repository<DiagnosisEntry>;
  let userRepository: Repository<User>;
  let dataSource: DataSource;
  let dbBackup: PGMem.IBackup;

  async function saveTestUser(overrides?: Partial<User>): Promise<User> {
    return userRepository.save(
      userRepository.create({
        email: "test@example.com",
        password: "hashed",
        role: UserRole.USER,
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
        DiagnosisService,
        {
          provide: getRepositoryToken(DiagnosisEntry),
          useValue: dataSource.getRepository(DiagnosisEntry),
        },
      ],
    }).compile();

    diagnosisService = module.get(DiagnosisService);
    diagnosisEntryRepository = dataSource.getRepository(DiagnosisEntry);
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

  describe("createDiagnosisEntry", () => {
    it("success: 진단 결과 저장", async () => {
      // Given
      const user = await saveTestUser();

      // When: 진단 결과 저장 시도
      const entry = await diagnosisService.createDiagnosisEntry({
        userId: user.id,
        depressionScore: 10,
        anxietyScore: 8,
        stressScore: 12,
      });

      // Then: 진단 결과 저장
      const saved = await diagnosisEntryRepository.findOneBy({ id: entry.id });
      expect(saved).toMatchObject({
        userId: user.id,
        depressionScore: 10,
        anxietyScore: 8,
        stressScore: 12,
      });
    });
  });

  describe("getLatestDiagnosisEntry", () => {
    it("success: 가장 최근 자가진단 결과 조회", async () => {
      // Given
      const user = await saveTestUser();
      await diagnosisService.createDiagnosisEntry({
        userId: user.id,
        depressionScore: 10,
        anxietyScore: 8,
        stressScore: 12,
      });
      const latestEntry = await diagnosisService.createDiagnosisEntry({
        userId: user.id,
        depressionScore: 30,
        anxietyScore: 20,
        stressScore: 40,
      });

      // When: 가장 최근 자가진단 결과 조회
      const entry = await diagnosisService.getLatestDiagnosisEntry(user.id);

      // Then: 가장 최근에 저장한 결과 반환
      expect(entry).toMatchObject({
        id: latestEntry.id,
        depressionScore: 30,
        anxietyScore: 20,
        stressScore: 40,
      });
    });

    it("success: 다른 사용자의 진단 결과는 조회되지 않음", async () => {
      // Given
      const user = await saveTestUser();
      const otherUser = await saveTestUser({ email: "other@example.com" });
      await diagnosisService.createDiagnosisEntry({
        userId: otherUser.id,
        depressionScore: 30,
        anxietyScore: 20,
        stressScore: 40,
      });

      // When, Then: 진단 기록이 없으므로 에러 발생
      await expect(
        diagnosisService.getLatestDiagnosisEntry(user.id),
      ).rejects.toThrow(DiagnosisNotFoundError);
    });

    it("fail: 자가진단 기록이 없으면 DiagnosisNotFoundError", async () => {
      // Given
      const user = await saveTestUser();

      // When: 자가진단 결과 조회
      const getEntry = diagnosisService.getLatestDiagnosisEntry(user.id);

      // Then: 404 DiagnosisNotFoundError 발생
      await expect(getEntry).rejects.toThrow(DiagnosisNotFoundError);
      await expect(getEntry).rejects.toMatchObject({
        statusCode: HttpStatus.NOT_FOUND,
        errorCode: DiagnosisErrorCode.DIAGNOSIS_NOT_FOUND,
      });
    });
  });
});
