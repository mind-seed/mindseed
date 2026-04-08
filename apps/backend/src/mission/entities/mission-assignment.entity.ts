import { User } from "src/user/entities/user.entity";
import { Mission } from "./mission.entity";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

export enum MissionAssignmentStatus {
  UNCOMPLETED = "UNCOMPLETED",
  COMPLETED = "COMPLETED",
}

@Entity({ name: "mission_assignment" })
export class MissionAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "user_id" })
  userId: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "mission_id" })
  missionId: number;

  @ManyToOne(() => Mission, { onDelete: "CASCADE" })
  @JoinColumn({ name: "mission_id" })
  mission: Mission;

  @Column({ type: "timestamptz", name: "available_from" })
  availableFrom: Date;

  @Column({ type: "timestamptz", name: "available_until" })
  availableUntil: Date;

  @Column({
    type: "enum",
    enum: MissionAssignmentStatus,
    default: MissionAssignmentStatus.UNCOMPLETED,
  })
  status: MissionAssignmentStatus;

  @Column({ type: "timestamptz", name: "completed_at", nullable: true })
  completedAt: Date | null;
}
