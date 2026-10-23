import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Temporal } from "@js-temporal/polyfill";
import { TimestampColumn } from "src/database/decorators/temporal.decorators";
import { User } from "src/user/entities/user.entity";

@Entity({ name: "refresh_token" })
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @TimestampColumn()
  expiresAt: Temporal.Instant;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn()
  user: User;
}
