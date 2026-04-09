import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  OffsetPaginationOptions,
  OffsetPaginationResult,
} from "src/common/types/pagination";
import { Mission, TestCategory } from "./entities/mission.entity";
import { MissionNotFoundError } from "./mission.errors";

export type ListMissionsOptions = OffsetPaginationOptions<"minLevel">;

export type ListMissionsResult = OffsetPaginationResult<Mission>;

export type CreateMissionOptions = {
  title: string;
  description: string;
  minLevel: number;
  points: number;
  category: TestCategory;
};

export type UpdateMissionOptions = {
  id: number;
  title: string;
  description: string;
  minLevel: number;
  points: number;
  category: TestCategory;
};

/*
 * controller에서 사용될, 미션 관리와 관련된 orchestration을 담당한다.
 */
@Injectable()
export class MissionManagementService {
  constructor(
    @InjectRepository(Mission)
    private readonly missionRepository: Repository<Mission>,
  ) {}

  async listMissions({
    offset,
    limit,
    orderBy,
    orderDirection,
  }: ListMissionsOptions): Promise<ListMissionsResult> {
    const sqlDirection = orderDirection === "asc" ? "ASC" : "DESC";
    const orderPath = (
      {
        minLevel: "mission.minLevel",
      } as const
    )[orderBy];

    const items = await this.missionRepository
      .createQueryBuilder("mission")
      .orderBy()
      .orderBy(orderPath, sqlDirection)
      .addOrderBy("mission.id", sqlDirection)
      .skip(offset)
      .take(limit + 1)
      .getMany();

    return {
      items: items.slice(0, limit),
      hasNext: items.length > limit,
    };
  }

  async createMission(options: CreateMissionOptions): Promise<Mission> {
    return this.missionRepository.save(this.missionRepository.create(options));
  }

  async updateMission({ id, ...fields }: UpdateMissionOptions): Promise<void> {
    const mission = await this.missionRepository.findOneBy({ id });
    if (!mission) {
      throw new MissionNotFoundError();
    }

    await this.missionRepository.save({ ...mission, ...fields });
  }

  async deleteMission(id: number): Promise<void> {
    const mission = await this.missionRepository.findOneBy({ id });
    if (!mission) {
      throw new MissionNotFoundError();
    }

    await this.missionRepository.delete(id);
  }
}
