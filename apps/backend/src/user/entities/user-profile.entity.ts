import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity({ name: "user_profile" })
export class UserProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nickname: string;

  @Column()
  age: number;

  @Column({ default: 0 })
  points: number;

  @Column({ default: 0 })
  level: number;

  @Column({ name: "character_index", default: 0 })
  characterIndex: number;

  @Column({ name: "user_id" })
  userId: number;

  @OneToOne(() => User, (user) => user.profile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;
}
