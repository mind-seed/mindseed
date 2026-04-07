import { Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import {
  MissionAssignment,
  MissionAssignmentStatus,
} from "./entities/mission-assignment.entity";
import { UserProfile } from "src/user/entities/user-profile.entity";
import { LevelCalculatorService } from "./level-points/level-points-calculator.service";
import {
  MissionAssignmentNotFoundError,
  MissionAssignmentNotForDateError,
  MissionAssignmentAlreadyCompletedError,
} from "./mission.errors";

export type CompleteMissionResult = {
  points: number;
  level: number;
};

/**
 * 유저의 미션 참여(조회, 완료)를 담당한다.
 */
@Injectable()
export class MissionParticipationService {
  constructor(
    @InjectRepository(MissionAssignment)
    private readonly missionAssignmentRepository: Repository<MissionAssignment>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    private readonly levelCalculatorService: LevelCalculatorService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 주어진 날짜에 해당하는 유저의 미션 assignment 목록을 조회한다.
   */
  async listMissionAssignmentsForDate(
    userId: number,
    date: Date,
  ): Promise<MissionAssignment[]> {
    return this.missionAssignmentRepository
      .createQueryBuilder("a")
      .leftJoinAndSelect("a.mission", "mission")
      .where("a.userId = :userId", { userId })
      .andWhere("a.availableFrom <= :date", { date })
      .andWhere("a.availableUntil >= :date", { date })
      .getMany();
  }

  /**
   * missionAssignment가 가리키는 미션 assignment 완료 처리한다.
   * @returns 업데이트된 유저의 points와 level
   */
  async completeMissionAssignment(
    userId: number,
    missionAssignmentId: number,
    date: Date,
  ): Promise<CompleteMissionResult> {
    const assignment = await this.missionAssignmentRepository.findOne({
      where: { id: missionAssignmentId, userId },
      relations: ["mission"],
    });

    if (!assignment) {
      throw new MissionAssignmentNotFoundError();
    }

    if (date < assignment.availableFrom || date > assignment.availableUntil) {
      throw new MissionAssignmentNotForDateError();
    }

    if (assignment.status === MissionAssignmentStatus.COMPLETED) {
      throw new MissionAssignmentAlreadyCompletedError();
    }

    const profile = (await this.userProfileRepository.findOneBy({ userId }))!;

    const { level, points } = this.levelCalculatorService.addPoints(
      { level: profile.level, points: profile.points },
      assignment.mission.points,
    );

    await this.dataSource.transaction(async (manager) => {
      profile.level = level;
      profile.points = points;
      await manager.save(profile);

      assignment.status = MissionAssignmentStatus.COMPLETED;
      assignment.completedAt = new Date();
      await manager.save(assignment);
    });

    return { level, points };
  }
}
