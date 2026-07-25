import { Injectable } from "@nestjs/common";
import { Temporal } from "@js-temporal/polyfill";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, Repository } from "typeorm";
import { S3Queue, S3QueueStatus } from "./entities/s3-queue";

@Injectable()
export class S3ProcessingRecoveryCron {
  constructor(
    @InjectRepository(S3Queue)
    private readonly s3QueueRepository: Repository<S3Queue>,
  ) {}

  @Cron("0 */5 * * * *")
  async handleCron(): Promise<void> {
    const staleBefore = Temporal.Now.instant().subtract({ minutes: 10 });

    const result = await this.s3QueueRepository.update(
      {
        status: S3QueueStatus.PROCESSING,
        processingStartedAt: LessThan(staleBefore),
      },
      {
        status: S3QueueStatus.PENDING,
        processingStartedAt: null,
      },
    );

    console.log(
      `[S3ProcessingRecoveryCron] recovered ${result.affected ?? 0} stale processing queues`,
    );
  }
}
