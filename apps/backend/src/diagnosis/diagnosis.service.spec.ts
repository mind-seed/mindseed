import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import PGMem from "pg-mem";
import { DiagnosisService } from "./diagnosis.service";
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
});
