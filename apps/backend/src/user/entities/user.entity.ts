import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Temporal } from "@js-temporal/polyfill";
import {
  CreateTimestampColumn,
  DeleteTimestampColumn,
} from "src/database/decorators/temporal.decorators";
import { UserProfile } from "./user-profile.entity";
import assert from "node:assert";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

// 2026-03-19: domain constraint 수준의 invariant를 유지하기 위해 domain 객체
// 레이어를 추가하는 것은 현재 프로젝트 스펙 상 오버헤드라고 판단하였습니다.
// 따라서 현재는 getter 기반으로 invariant를 표현했습니다.

/*
 * invariant (1): .profile이 non-null이라면, .role === USER이며,
 * 그 반대도 마찬가지이다.
 */
@Entity({ name: "user" })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @CreateTimestampColumn()
  createdAt: Temporal.Instant;

  @DeleteTimestampColumn()
  deletedAt: Temporal.Instant | null;

  @OneToOne(() => UserProfile, (profile) => profile.user, { cascade: true })
  profile: UserProfile | null;

  /*
   * (1) 을 type level에서 구현한다.
   * assumption: userProfile이 접근되는 User는 USER role을 가진다.
   */
  get userProfile(): UserProfile {
    assert(
      this.role === UserRole.USER,
      "User: .userProfile can be used iff .role === UserRole.USER",
    );
    return this.profile!;
  }
}
