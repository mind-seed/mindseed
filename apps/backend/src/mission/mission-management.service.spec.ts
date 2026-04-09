import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import PGMem from "pg-mem";
import { MissionManagementService } from "./mission-management.service";
import { Mission, TestCategory } from "./entities/mission.entity";
import { MissionNotFoundError } from "./mission.errors";
import { initializePgMem } from "src/test/pg-mem.helper";

const entities = [Mission];

describe("MissionManagementService", () => {
  let module: TestingModule;
  let missionManagementService: MissionManagementService;
  let missionRepository: Repository<Mission>;
  let dataSource: DataSource;
  let dbBackup: PGMem.IBackup;

  async function saveTestMission(
    overrides?: Partial<Mission>,
  ): Promise<Mission> {
    return missionRepository.save(
      missionRepository.create({
        title: "test mission",
        description: "test description",
        minLevel: 0,
        category: TestCategory.ANXIETY,
        points: 10,
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
        MissionManagementService,
        {
          provide: getRepositoryToken(Mission),
          useValue: dataSource.getRepository(Mission),
        },
      ],
    }).compile();

    missionManagementService = module.get(MissionManagementService);
    missionRepository = dataSource.getRepository(Mission);
  });

  beforeEach(() => {
    dbBackup.restore();
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  describe("listMissions", () => {
    it("success: 각 parameter 처리", async () => {
      // Given: 미션
      const m1 = await saveTestMission({ minLevel: 0 });
      const m2 = await saveTestMission({ minLevel: 2 });
      const m3 = await saveTestMission({ minLevel: 1 });
      const m4 = await saveTestMission({ minLevel: 3 });

      // When: 첫 페이지 조회
      const result = await missionManagementService.listMissions({
        offset: 0,
        limit: 2,
        orderBy: "minLevel",
        orderDirection: "asc",
      });

      // Then: 올바른 결과 반환
      expect(result.items.map((m) => m.id)).toEqual([m1.id, m3.id]);
      expect(result.hasNext).toBe(true);

      // When: 다음 페이지 조회
      const result2 = await missionManagementService.listMissions({
        offset: 2,
        limit: 2,
        orderBy: "minLevel",
        orderDirection: "asc",
      });

      // Then: 올바른 결과 반환
      expect(result2.items.map((m) => m.id)).toEqual([m2.id, m4.id]);
      expect(result2.hasNext).toBe(false);
    });
  });

  describe("createMission", () => {
    it("success: 미션 생성", async () => {
      // When: 미션 생성 시도
      const mission = await missionManagementService.createMission({
        title: "new mission",
        description: "description",
        minLevel: 1,
        points: 20,
        category: TestCategory.STRESS,
      });

      // Then: 미션 생성
      const saved = await missionRepository.findOneBy({ id: mission.id });
      expect(saved).toMatchObject({
        title: "new mission",
        description: "description",
        minLevel: 1,
        points: 20,
        category: TestCategory.STRESS,
      });
    });
  });

  describe("updateMission", () => {
    it("success: 미션 업데이트", async () => {
      // Given: 미션이 존재하는 경우
      const mission = await saveTestMission();

      // When: 미션 업데이트 시도
      await missionManagementService.updateMission({
        id: mission.id,
        title: "updated title",
        description: "updated description",
        minLevel: 2,
        points: 30,
        category: TestCategory.DEPRESSION,
      });

      // Then: 미션 업데이트
      const updated = await missionRepository.findOneBy({ id: mission.id });
      expect(updated).toMatchObject({
        title: "updated title",
        description: "updated description",
        minLevel: 2,
        points: 30,
        category: TestCategory.DEPRESSION,
      });
    });

    it("존재하지 않는 미션 처리", async () => {
      // Given: 미션이 존재하지 않는 경우
      const nonExistentMissionId = 0;

      // When: 미션 업데이트 시도
      const result = missionManagementService.updateMission({
        id: nonExistentMissionId,
        title: "updated title",
        description: "updated description",
        minLevel: 2,
        points: 30,
        category: TestCategory.DEPRESSION,
      });

      // Then: throws handled error
      await expect(result).rejects.toThrow(MissionNotFoundError);
    });
  });

  describe("deleteMission", () => {
    it("success: 미션 삭제", async () => {
      // Given: 미션이 존재하는 경우
      const mission = await saveTestMission();

      // When: 미션 삭제 시도
      await missionManagementService.deleteMission(mission.id);

      // Then: 미션 삭제됨
      expect(await missionRepository.findOneBy({ id: mission.id })).toBeNull();
    });

    it("존재하지 않는 미션 처리", async () => {
      // Given: 미션이 존재하지 않는 경우
      const nonExistentMissionId = 0;

      // When: 미션 삭제 시도
      const result =
        missionManagementService.deleteMission(nonExistentMissionId);

      // Then: throws handled error
      await expect(result).rejects.toThrow(MissionNotFoundError);
    });
  });
});
