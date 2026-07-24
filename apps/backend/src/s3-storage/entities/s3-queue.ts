import { CreateTimestampColumn } from "src/database/decorators/temporal.decorators";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Temporal } from "@js-temporal/polyfill";

export enum S3QueueStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
}

@Entity({ name: "s3_queue" })
export class S3Queue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  attachmentKey: string;

  @Column({ type: "enum", enum: S3QueueStatus, default: S3QueueStatus.PENDING })
  status: S3QueueStatus;

  // 시도 횟수
  @Column({ default: 0 })
  attemptCount: number;

  // 생성 일시
  @CreateTimestampColumn()
  createdAt: Temporal.Instant;
}
