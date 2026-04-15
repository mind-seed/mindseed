import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Temporal } from "@js-temporal/polyfill";
import { CreateTimestampColumn } from "src/database/decorators/temporal.decorators";
import { User } from "src/user/entities/user.entity";

@Entity({ name: "diagnosis_entry" })
export class DiagnosisEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "user_id" })
  userId: number;

  @Column({ name: "depression_score" })
  depressionScore: number;

  @Column({ name: "anxiety_score" })
  anxietyScore: number;

  @Column({ name: "stress_score" })
  stressScore: number;

  @CreateTimestampColumn({ name: "created_at" })
  createdAt: Temporal.Instant;
}
