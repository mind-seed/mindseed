import { User, UserRole } from "src/user/entities/user.entity";
import { MissionGenerationService } from "./mission-generation.service";
import { Repository } from "typeorm";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Temporal } from "@js-temporal/polyfill";
import { timeZoneConfig } from "src/config";
import type { ConfigType } from "@nestjs/config";

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

const USER_CHUNK_SIZE = 50;

/**
 * mission assignment의 batch processing을 담당한다.
 */
@Injectable()
export class MissionGenerationJob {
  private readonly logger = new Logger(MissionGenerationJob.name);

  constructor(
    @Inject(timeZoneConfig.KEY)
    private readonly timeZoneCfg: ConfigType<typeof timeZoneConfig>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly missionGenerationService: MissionGenerationService,
  ) {}

  async assignMissionsToUsers(): Promise<void> {
    const nowZdt = Temporal.Now.zonedDateTimeISO(this.timeZoneCfg.timeZone);
    const users = await this.userRepository.find({
      select: { id: true },
      where: { role: UserRole.USER },
    });
    const chunks = chunk(users, USER_CHUNK_SIZE);

    for (const chunk of chunks) {
      const results = await Promise.allSettled(
        chunk.map((user) =>
          this.missionGenerationService.assignMissionsToUser(user.id, nowZdt),
        ),
      );
      const failures = results.filter((result) => result.status === "rejected");
      if (failures.length > 0) {
        this.logger.error(
          `${failures.length} (chunk size: ${chunk.length}) 명의 user에 대한 assignment 실패`,
        );
      }
    }
  }
}
