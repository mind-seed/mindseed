import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "src/user/entities/user.entity";

@Entity({ name: "diagnosis_entry" })
export class DiagnosisEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
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

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt: Date;
}
