import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { CronExpression, SchedulerRegistry } from "@nestjs/schedule";
import type { ConfigType } from "@nestjs/config";
import { CronJob } from "cron";
import { MissionGenerationJob } from "./mission-generation.job";
import { timeZoneConfig } from "src/config";

@Injectable()
export class MissionGenerationCron implements OnModuleInit {
  constructor(
    @Inject(timeZoneConfig.KEY)
    private readonly timeZoneCfg: ConfigType<typeof timeZoneConfig>,
    private readonly missionGenerationJob: MissionGenerationJob,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    const job = new CronJob(
      CronExpression.EVERY_DAY_AT_MIDNIGHT,
      () => this.handleCron(),
      null,
      true,
      this.timeZoneCfg.timeZone,
    );

    this.schedulerRegistry.addCronJob("mission-generation", job);
  }

  private async handleCron(): Promise<void> {
    await this.missionGenerationJob.assignMissionsToUsers();
  }
}
