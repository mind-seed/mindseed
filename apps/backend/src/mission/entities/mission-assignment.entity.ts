import { User } from "src/user/entities/user.entity";
import { Mission } from "./mission.entity";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Temporal } from "@js-temporal/polyfill";
import { TimestampColumn } from "src/database/decorators/temporal.decorators";

export enum MissionAssignmentStatus {
  UNCOMPLETED = "UNCOMPLETED",
  COMPLETED = "COMPLETED",
}

@Entity({ name: "mission_assignment" })
export class MissionAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn()
  user: User;

  @Column()
  missionId: number;

  @ManyToOne(() => Mission, { onDelete: "CASCADE" })
  @JoinColumn()
  mission: Mission;

  @TimestampColumn()
  availableFrom: Temporal.Instant;

  @TimestampColumn()
  availableUntil: Temporal.Instant;

  @Column({
    type: "enum",
    enum: MissionAssignmentStatus,
    default: MissionAssignmentStatus.UNCOMPLETED,
  })
  status: MissionAssignmentStatus;

  @TimestampColumn({ nullable: true })
  completedAt: Temporal.Instant | null;
}
