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
  @JoinColumn()
  user: User;

  @Column()
  userId: number;

  @Column()
  depressionScore: number;

  @Column()
  anxietyScore: number;

  @Column()
  stressScore: number;

  @CreateTimestampColumn()
  createdAt: Temporal.Instant;
}
