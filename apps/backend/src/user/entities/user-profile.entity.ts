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

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  characterIndex: number;

  @Column()
  userId: number;

  @OneToOne(() => User, (user) => user.profile, { onDelete: "CASCADE" })
  @JoinColumn()
  user: User;
}
