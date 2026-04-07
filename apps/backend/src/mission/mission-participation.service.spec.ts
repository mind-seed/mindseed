import { Test, TestingModule } from "@nestjs/testing";
import { getDataSourceToken, getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import PGMem from "pg-mem";
import { MissionParticipationService } from "./mission-participation.service";
import { Mission, TestCategory } from "./entities/mission.entity";
import {
  MissionAssignment,
  MissionAssignmentStatus,
} from "./entities/mission-assignment.entity";
import { User, UserRole } from "src/user/entities/user.entity";
import { UserProfile } from "src/user/entities/user-profile.entity";
import { initializePgMem } from "src/test/pg-mem.helper";
import {
  MissionAssignmentNotFoundError,
  MissionAssignmentNotForDateError,
  MissionAssignmentAlreadyCompletedError,
} from "./mission.errors";
import {
  LevelCalculatorService,
  MAX_LEVEL_TOKEN,
  POINTS_FOR_NEXT_LEVEL_TOKEN,
  PointsForNextLevel,
} from "./level-points/level-points-calculator.service";

const testMaxLevel = 3;
const testPointsForNextLevel: PointsForNextLevel = {
  1: 100,
  2: 200,
};

const entities = [UserProfile, User, Mission, MissionAssignment];

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

async function saveTestUserProfile(
  repository: Repository<UserProfile>,
  user: User,
  overrides?: Partial<UserProfile>,
): Promise<UserProfile> {
  return repository.save(
    repository.create({
      user,
      nickname: "testnick",
      age: 20,
      points: 0,
      level: 0,
      characterIndex: 0,
      ...overrides,
    }),
  );
}

async function saveTestMission(
  repository: Repository<Mission>,
  overrides?: Partial<Mission>,
): Promise<Mission> {
  return repository.save(
    repository.create({
      title: "test mission",
      description: "test description",
      minLevel: 0,
      category: TestCategory.ANXIETY,
      points: 10,
      ...overrides,
    }),
  );
}

async function saveTestAssignment(
  repository: Repository<MissionAssignment>,
  userId: number,
  missionId: number,
  dueDate: Date,
  overrides?: Partial<MissionAssignment>,
): Promise<MissionAssignment> {
  const availableFrom = new Date(dueDate);
  availableFrom.setHours(0, 0, 0, 0);
  const availableUntil = new Date(dueDate);
  availableUntil.setHours(23, 59, 59, 999);

  return repository.save(
    repository.create({
      userId,
      missionId,
      availableFrom,
      availableUntil,
      status: MissionAssignmentStatus.UNCOMPLETED,
      completedAt: null,
      ...overrides,
    }),
  );
}

describe("MissionParticipationService", () => {
  let module: TestingModule;
  let missionParticipationService: MissionParticipationService;
  let missionRepository: Repository<Mission>;
  let missionAssignmentRepository: Repository<MissionAssignment>;
  let userRepository: Repository<User>;
  let userProfileRepository: Repository<UserProfile>;
  let dataSource: DataSource;
  let dbBackup: PGMem.IBackup;

  beforeAll(async () => {
    const { dataSource: ds, backup } = await initializePgMem(entities);
    dataSource = ds;
    dbBackup = backup;

    module = await Test.createTestingModule({
      providers: [
        MissionParticipationService,
        { provide: MAX_LEVEL_TOKEN, useValue: testMaxLevel },
        {
          provide: POINTS_FOR_NEXT_LEVEL_TOKEN,
          useValue: testPointsForNextLevel,
        },
        LevelCalculatorService,
        {
          provide: getDataSourceToken(),
          useValue: dataSource,
        },
        {
          provide: getRepositoryToken(Mission),
          useValue: dataSource.getRepository(Mission),
        },
        {
          provide: getRepositoryToken(MissionAssignment),
          useValue: dataSource.getRepository(MissionAssignment),
        },
        {
          provide: getRepositoryToken(UserProfile),
          useValue: dataSource.getRepository(UserProfile),
        },
      ],
    }).compile();

    missionParticipationService = module.get(MissionParticipationService);
    missionRepository = dataSource.getRepository(Mission);
    missionAssignmentRepository = dataSource.getRepository(MissionAssignment);
    userRepository = dataSource.getRepository(User);
    userProfileRepository = dataSource.getRepository(UserProfile);
  });

  beforeEach(() => {
    dbBackup.restore();
    jest.restoreAllMocks();
  });

  describe("listMissionAssignmentsForDate", () => {
    it("success: 주어진 날짜의 assignment 목록 반환", async () => {
      // Given: 날짜
      const date = new Date("2025-01-15T00:00:00Z");
      const otherDate = new Date("2025-01-16T00:00:00Z");
      const user = await saveTestUser(userRepository);
      await saveTestUserProfile(userProfileRepository, user);
      const mission1 = await saveTestMission(missionRepository);
      const mission2 = await saveTestMission(missionRepository);
      const assignment1 = await saveTestAssignment(
        missionAssignmentRepository,
        user.id,
        mission1.id,
        date,
      );
      const assignment2 = await saveTestAssignment(
        missionAssignmentRepository,
        user.id,
        mission2.id,
        date,
      );
      await saveTestAssignment(
        missionAssignmentRepository,
        user.id,
        mission1.id,
        otherDate,
      );

      // When: assignmeent 목록 조회 시도
      const result =
        await missionParticipationService.listMissionAssignmentsForDate(
          user.id,
          date,
        );

      // Then: 주어진 날짜에 대한 assignment만 올바르게 반환
      expect(result.map((a) => a.id)).toEqual(
        expect.arrayContaining([assignment1.id, assignment2.id]),
      );
      expect(result).toHaveLength(2);
    });
  });

  describe("completeMissionAssignment", () => {
    it("success: 최대 레벨이 아닌 경우 처리", async () => {
      // Given: 최대 레벨이 아닌 사용자, 현재 날짜에 대한 완료하지 않은
      // assignment
      const user = await saveTestUser(userRepository);
      await saveTestUserProfile(userProfileRepository, user, {
        level: 1,
        points: 0,
      });
      const currentDate = new Date("2025-01-15T00:00:00Z");
      const mission = await saveTestMission(missionRepository, { points: 10 });
      const assignment = await saveTestAssignment(
        missionAssignmentRepository,
        user.id,
        mission.id,
        currentDate,
      );

      // When: assignment 완료 처리 시도
      const result =
        await missionParticipationService.completeMissionAssignment(
          user.id,
          assignment.id,
          currentDate,
        );

      // Then: 새로운 레벨과 포인트 반환
      expect(result).toEqual({ level: 1, points: 10 });

      // Then: assignment 및 profile 업데이트
      const updatedAssignment = await missionAssignmentRepository.findOneBy({
        id: assignment.id,
      });
      expect(updatedAssignment!.status).toBe(MissionAssignmentStatus.COMPLETED);
      expect(updatedAssignment!.completedAt).not.toBeNull();
      const updatedProfile = await userProfileRepository.findOneBy({
        userId: user.id,
      });
      expect(updatedProfile!.level).toBe(1);
      expect(updatedProfile!.points).toBe(10);
    });

    it("success: 레벨업이 발생한 경우 처리", async () => {
      // Given: 최대 레벨이 아니며 레벨업 예정인 사용자, 현재 날짜에 대한
      // 완료하지 않은 assignment
      const user = await saveTestUser(userRepository);
      await saveTestUserProfile(userProfileRepository, user, {
        level: 1,
        points: 90,
      });
      const currentDate = new Date("2025-01-15T00:00:00Z");
      const mission = await saveTestMission(missionRepository, { points: 10 });
      const assignment = await saveTestAssignment(
        missionAssignmentRepository,
        user.id,
        mission.id,
        currentDate,
      );

      // When: assignment 완료 처리 시도
      const result =
        await missionParticipationService.completeMissionAssignment(
          user.id,
          assignment.id,
          currentDate,
        );

      // Then: 새로운 레벨과 포인트 반환
      expect(result).toEqual({ level: 2, points: 0 });

      // Then: assignment 및 profile 업데이트
      const updatedAssignment = await missionAssignmentRepository.findOneBy({
        id: assignment.id,
      });
      expect(updatedAssignment!.status).toBe(MissionAssignmentStatus.COMPLETED);
      expect(updatedAssignment!.completedAt).not.toBeNull();
      const updatedProfile = await userProfileRepository.findOneBy({
        userId: user.id,
      });
      expect(updatedProfile!.level).toBe(2);
      expect(updatedProfile!.points).toBe(0);
    });

    it("success: 최대 레벨인 경우 처리", async () => {
      // Given: 최대 레벨인 사용자, 현재 날짜에 대한
      // 완료하지 않은 assignment
      const user = await saveTestUser(userRepository);
      await saveTestUserProfile(userProfileRepository, user, {
        level: testMaxLevel,
        points: 0,
      });
      const currentDate = new Date("2025-01-15T00:00:00Z");
      const mission = await saveTestMission(missionRepository, { points: 10 });
      const assignment = await saveTestAssignment(
        missionAssignmentRepository,
        user.id,
        mission.id,
        currentDate,
      );

      // When: assignment 완료 처리 시도
      const result =
        await missionParticipationService.completeMissionAssignment(
          user.id,
          assignment.id,
          currentDate,
        );

      // Then: 새로운 레벨과 포인트 반환
      expect(result).toEqual({ level: testMaxLevel, points: 0 });

      // Then: assignment 및 profile 업데이트
      const updatedAssignment = await missionAssignmentRepository.findOneBy({
        id: assignment.id,
      });
      expect(updatedAssignment!.status).toBe(MissionAssignmentStatus.COMPLETED);
      expect(updatedAssignment!.completedAt).not.toBeNull();
      const updatedProfile = await userProfileRepository.findOneBy({
        userId: user.id,
      });
      expect(updatedProfile!.level).toBe(testMaxLevel);
      expect(updatedProfile!.points).toBe(0);
    });

    it("사용자에 대해 존재하지 않는 assignment 처리", async () => {
      // Given: 사용자에 대해 존재하지 않는 assignment
      const user = await saveTestUser(userRepository);
      await saveTestUserProfile(userProfileRepository, user);
      const otherUser = await saveTestUser(userRepository);
      await saveTestUserProfile(userProfileRepository, otherUser);
      const currentDate = new Date("2025-01-15T00:00:00Z");
      const mission = await saveTestMission(missionRepository);
      const otherAssignment = await saveTestAssignment(
        missionAssignmentRepository,
        otherUser.id,
        mission.id,
        currentDate,
      );

      // When: assignment 완료 처리 시도
      const result = missionParticipationService.completeMissionAssignment(
        user.id,
        otherAssignment.id,
        currentDate,
      );

      // Then: throws handled error
      await expect(result).rejects.toThrow(MissionAssignmentNotFoundError);
    });

    it("주어진 날짜에 대한 assignment가 아닌 경우 처리", async () => {
      // Given: 주어진 날짜에 대해 존재하지 않는 assignment
      const user = await saveTestUser(userRepository);
      await saveTestUserProfile(userProfileRepository, user);
      const assignmentDate = new Date("2025-01-14T00:00:00Z");
      const currentDate = new Date("2025-01-15T00:00:00Z");
      const mission = await saveTestMission(missionRepository);
      const assignment = await saveTestAssignment(
        missionAssignmentRepository,
        user.id,
        mission.id,
        assignmentDate,
      );

      // When: assignment 완료 처리 시도
      const result = missionParticipationService.completeMissionAssignment(
        user.id,
        assignment.id,
        currentDate,
      );

      // Then: throws handled error
      await expect(result).rejects.toThrow(MissionAssignmentNotForDateError);
    });

    it("이미 완료한 assignment 처리", async () => {
      // Given: 이미 완료한 assignment
      const user = await saveTestUser(userRepository);
      await saveTestUserProfile(userProfileRepository, user);
      const currentDate = new Date("2025-01-15T00:00:00Z");
      const mission = await saveTestMission(missionRepository);
      const assignment = await saveTestAssignment(
        missionAssignmentRepository,
        user.id,
        mission.id,
        currentDate,
        {
          status: MissionAssignmentStatus.COMPLETED,
          completedAt: currentDate,
        },
      );

      // When: assignment 완료 처리 시도
      const result = missionParticipationService.completeMissionAssignment(
        user.id,
        assignment.id,
        currentDate,
      );

      // Then: throws handled error
      await expect(result).rejects.toThrow(
        MissionAssignmentAlreadyCompletedError,
      );
    });
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });
});
