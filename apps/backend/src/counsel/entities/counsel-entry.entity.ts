import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Temporal } from "@js-temporal/polyfill";
import {
  CreateTimestampColumn,
  UpdateTimestampColumn,
} from "src/database/decorators/temporal.decorators";
import { User } from "src/user/entities/user.entity";

export enum CounselCategory {
  ANXIETY = "ANXIETY",
  DEPRESSION = "DEPRESSION",
  STRESS = "STRESS",
  OTHER = "OTHER",
}

@Entity({ name: "counsel" })
export class CounselEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: "text" })
  content: string;

  @Column({ type: "enum", enum: CounselCategory })
  category: CounselCategory;

  @Column()
  authorId: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn()
  author: User;

  @CreateTimestampColumn()
  createdAt: Temporal.Instant;

  @UpdateTimestampColumn()
  updatedAt: Temporal.Instant;

  @Column()
  responderId: number | null;

  // 2026-04-16 onDelete option을 지정하지 않았습니다. 현재는 ADMIN user는
  // 회원탈퇴를 하지 않을 것이라고 가정하고 있으며, CASCADE로 설정 시
  // responseContent 처리가 애매해짐을 근거로 하였습니다. 추후 문제가 될 경우
  // response entity를 분리하는 방식으로 처리해야 할 듯 합니다.
  @ManyToOne(() => User)
  @JoinColumn()
  responder: User | null;

  @Column({ type: "text" })
  responseContent: string | null;
}
