import { Inject, Injectable } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { s3Config } from "src/config";
import { In, Repository } from "typeorm";
import { S3_CLIENT } from "./s3-client.di-token";
import { S3Queue, S3QueueStatus } from "./entities/s3-queue";

const BATCH_SIZE = 20;

@Injectable()
export class S3DeleteCron {
  private isRunning = false;

  constructor(
    @Inject(S3_CLIENT) private readonly s3Client: S3Client,
    @Inject(s3Config.KEY)
    private readonly s3cfg: ConfigType<typeof s3Config>,
    @InjectRepository(S3Queue)
    private readonly s3QueueRepository: Repository<S3Queue>,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron(): Promise<void> {
    if (this.isRunning) {
      console.log("[S3DeleteCron] previous run is still processing");
      return;
    }

    this.isRunning = true;

    try {
      const queues = await this.claimPendingQueues();
      if (queues.length === 0) {
        console.log("[S3DeleteCron] no pending objects");
        return;
      }

      console.log(`[S3DeleteCron] claimed ${queues.length} objects`);

      const deletedQueueIds: number[] = [];

      for (const queue of queues) {
        try {
          console.log(
            `[S3DeleteCron] deleting id=${queue.id}, key=${queue.attachmentKey}`,
          );

          await this.s3Client.send(
            new DeleteObjectCommand({
              Bucket: this.s3cfg.bucket!,
              Key: queue.attachmentKey,
            }),
          );

          deletedQueueIds.push(queue.id);
          console.log(`[S3DeleteCron] deleted id=${queue.id}`);
        } catch (error) {
          await this.markAsPendingWithRetry(queue);
          console.log(
            `[S3DeleteCron] failed id=${queue.id}, key=${queue.attachmentKey}, error=${this.formatError(error)}`,
          );
        }
      }

      if (deletedQueueIds.length > 0) {
        await this.s3QueueRepository.delete({ id: In(deletedQueueIds) });
        console.log(`[S3DeleteCron] removed ${deletedQueueIds.length} queues`);
      }
    } finally {
      this.isRunning = false;
    }
  }

  private async claimPendingQueues(): Promise<S3Queue[]> {
    return this.s3QueueRepository.manager.transaction(async (manager) => {
      const repository = manager.getRepository(S3Queue);
      const queues = await repository
        .createQueryBuilder("queue")
        .where("queue.status = :status", { status: S3QueueStatus.PENDING })
        .orderBy("queue.attemptCount", "DESC")
        .addOrderBy("queue.createdAt", "DESC")
        .take(BATCH_SIZE)
        .setLock("pessimistic_write")
        .setOnLocked("skip_locked")
        .getMany();

      if (queues.length === 0) {
        return queues;
      }

      await repository.update(
        { id: In(queues.map((queue) => queue.id)) },
        { status: S3QueueStatus.PROCESSING },
      );

      return queues;
    });
  }

  private async markAsPendingWithRetry(queue: S3Queue): Promise<void> {
    await this.s3QueueRepository.update(
      { id: queue.id },
      {
        status: S3QueueStatus.PENDING,
        attemptCount: queue.attemptCount + 1,
      },
    );
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return `${error.name}: ${error.message}`;
    }
    return String(error);
  }
}
