import { Inject, Injectable } from "@nestjs/common";
import { Mission, TestCategory } from "../entities/mission.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MissionAssignment } from "../entities/mission-assignment.entity";
import { DiagnosisEntry } from "src/diagnosis/entities/diagnosis-entry.entity";
import { UserProfile } from "src/user/entities/user-profile.entity";
import { Temporal } from "@js-temporal/polyfill";
import {
  type MissionPicker,
  MISSION_PICKER_TOKEN,
} from "./mission-picker/mission-picker.common";
import { timeZoneConfig } from "src/config";
import type { ConfigType } from "@nestjs/config";
import { SimplifiedMission } from "./mission-generation.types";

const HISTORY_WINDOW_DAYS = 7;

const MIN_TOTAL_MISSIONS = 6;
const MAX_TOTAL_MISSIONS = 8;

type MissionWithAssignment = SimplifiedMission & {
  lastAssignedAt: Temporal.Instant | null;
};

type AvailableMissionPool = Record<TestCategory, MissionWithAssignment[]>;
type AssignmentCounts = Record<TestCategory, number>;

/**
 * 사용자에 대한 미션 할당을 담당한다.
 */
@Injectable()
export class MissionGenerationService {
  constructor(
    @Inject(timeZoneConfig.KEY)
    private readonly timeZoneCfg: ConfigType<typeof timeZoneConfig>,
    @InjectRepository(Mission)
    private readonly missionRepository: Repository<Mission>,
    @InjectRepository(MissionAssignment)
    private readonly missionAssignmentRepository: Repository<MissionAssignment>,
    @InjectRepository(DiagnosisEntry)
    private readonly diagnosisEntryRepository: Repository<DiagnosisEntry>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @Inject(MISSION_PICKER_TOKEN)
    private readonly missionPicker: MissionPicker,
  ) {}

  /**
   * 사용자에게 미션들을 할당한다.
   * @param userId 미션들을 할당할 사용자
   * @param assignedZdt 미션 할당일
   * output: DB에 MissionAssignment entity들을 생성한다.
   * 할당 시 사용자의 자가진단 결과 및 이전 미션 상태를 반영한다.
   */
  async assignMissionsToUser(
    userId: number,
    assignedZdt: Temporal.ZonedDateTime,
  ): Promise<void> {
    const [missionPool, lastDiagnosis] = await Promise.all([
      this.getAvailableMissions(userId, assignedZdt),
      this.diagnosisEntryRepository.findOne({
        where: { userId },
        order: { createdAt: "DESC" },
      }),
    ]);

    const counts = this.getAssignmentCounts(lastDiagnosis);

    const pickedMissions = Object.entries(missionPool).flatMap(
      ([category, missions]) =>
        this.missionPicker(
          missions.map((mission) => ({
            mission: {
              id: mission.id,
            },
            lastAssignedDay:
              mission.lastAssignedAt &&
              assignedZdt.since(
                mission.lastAssignedAt.toZonedDateTimeISO(
                  this.timeZoneCfg.timeZone,
                ),
                { largestUnit: "day" },
              ).days,
          })),
          counts[category as TestCategory],
        ),
    );

    const assignments = pickedMissions.map((mission) =>
      this.missionAssignmentRepository.create({
        userId,
        missionId: mission.id,
        availableFrom: assignedZdt.withPlainTime().toInstant(),
        availableUntil: assignedZdt
          .withPlainTime({
            hour: 23,
            minute: 59,
            second: 59,
          })
          .toInstant(),
      }),
    );

    await this.missionAssignmentRepository.save(assignments);
  }

  /**
   * 사용자에 할당 가능한 미션 목록을 카테고리별로 반환한다.
   * @param userId 사용자
   * @param nowZdt 현재 일시: 최신 assignment 정보 반영에 사용됨
   * @returns 최신 assignment 정보가 포함된, 카테고리별 미션 목록
   */
  private async getAvailableMissions(
    userId: number,
    nowZdt: Temporal.ZonedDateTime,
  ): Promise<AvailableMissionPool> {
    const profile = (await this.userProfileRepository.findOneBy({
      userId,
    }))!;

    const windowCutoff = nowZdt
      .subtract({ days: HISTORY_WINDOW_DAYS })
      .toInstant()
      .toString();

    const { entities, raw } = await this.missionRepository
      .createQueryBuilder("mission")
      .leftJoinAndMapOne(
        "mission.lastAssignment",
        (qb) =>
          qb
            .select("la.missionId", "missionId")
            .addSelect("MAX(la.availableFrom)", "lastAssignedAt")
            .from(MissionAssignment, "la")
            .where("la.userId = :userId", { userId })
            .andWhere("la.availableFrom >= :windowCutoff", { windowCutoff })
            .groupBy("la.missionId"),
        "last_assignment",
        'last_assignment."missionId" = mission.id',
      )
      .where("mission.minLevel <= :level", { level: profile.level })
      .getRawAndEntities();

    const pool: AvailableMissionPool = {
      [TestCategory.ANXIETY]: [],
      [TestCategory.DEPRESSION]: [],
      [TestCategory.STRESS]: [],
    };

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      pool[entity.category].push({
        id: entity.id,
        lastAssignedAt: raw[i].last_assignment_lastAssignedAt ?? null,
      });
    }

    return pool;
  }

  /**
   * 자가진단의 결과를 가중치로 하여 카테고리별 랜덤한 미션 개수를 반환한다.
   * @param diagnosis 자가진단 결과
   * @returns 카테고리별 할당될 미션 개수
   */
  private getAssignmentCounts(
    diagnosis: DiagnosisEntry | null,
  ): AssignmentCounts {
    const total =
      Math.floor(
        Math.random() * (MAX_TOTAL_MISSIONS - MIN_TOTAL_MISSIONS + 1),
      ) + MIN_TOTAL_MISSIONS;

    const baseScores: Record<TestCategory, number> = diagnosis
      ? {
          [TestCategory.ANXIETY]: diagnosis.anxietyScore,
          [TestCategory.DEPRESSION]: diagnosis.depressionScore,
          [TestCategory.STRESS]: diagnosis.stressScore,
        }
      : (Object.fromEntries(
          Object.values(TestCategory).map((c) => [c, 1]),
        ) as Record<TestCategory, number>);

    const JITTER = 0.2;
    const noisedScores = Object.fromEntries(
      Object.entries(baseScores).map(([category, score]) => [
        category,
        score * (1 + (Math.random() * 2 - 1) * JITTER),
      ]),
    ) as Record<TestCategory, number>;

    return this.scoresToMissionCounts(total, noisedScores) as AssignmentCounts;
  }

  /**
   * 총 미션 개수를 카테고리별 점수 비율에 맞게 분배한다.
   * @param total: total > 0
   * @param scores: scores.length > 0, scores[i] >= 0
   */
  private scoresToMissionCounts<T extends string>(
    total: number,
    scores: Record<T, number>,
  ): Record<T, number> {
    const scoreTotal = Object.values<number>(scores).reduce((a, b) => a + b, 0);
    if (scoreTotal === 0) {
      return this.scoresToMissionCounts(
        total,
        Object.fromEntries(Object.keys(scores).map((k) => [k, 1])) as Record<
          T,
          number
        >,
      );
    }

    const floored = Object.entries<number>(scores).map(([category, score]) => {
      const exact = (score / scoreTotal) * total;
      return {
        category,
        count: Math.floor(exact),
        remainder: exact - Math.floor(exact),
      };
    });

    const remaining = total - floored.reduce((a, b) => a + b.count, 0);

    floored
      .sort((a, b) => b.remainder - a.remainder)
      .slice(0, remaining)
      .forEach((entry) => entry.count++);

    return Object.fromEntries(
      floored.map(({ category, count }) => [category, count]),
    ) as Record<T, number>;
  }
}
