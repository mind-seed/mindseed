import { User, UserRole } from "src/user/entities/user.entity";
import { MissionGenerationService } from "./mission-generation.service";
import { Repository } from "typeorm";
import { Inject, Injectable } from "@nestjs/common";
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
      await Promise.all(
        chunk.map((user) =>
          this.missionGenerationService.assignMissionsToUser(user.id, nowZdt),
        ),
      );
    }
  }
}
