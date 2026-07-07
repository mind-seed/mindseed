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
  TimestampColumn,
} from "src/database/decorators/temporal.decorators";
import { Post } from "src/post/entities/post.entity";
import { User } from "src/user/entities/user.entity";
import { PostComment } from "src/comment/entities/post-comment.entity";

export enum ReportRange {
  POST = "POST",
  COMMENT = "COMMENT",
}
@Entity({ name: "report" })
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  // 신고 사유
  @Column()
  reason: string;

  // 종류 (post, comment)
  @Column({ type: "enum", enum: ReportRange })
  range: ReportRange;

  // 신고 대상 게시글 (게시글 삭제 시 함께 삭제)
  @ManyToOne(() => Post, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn() // post_id
  post: Post | null;

  // 신고 대상 댓글 (댓글 삭제 시 함께 삭제)
  @ManyToOne(() => PostComment, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn() // comment_id
  comment: PostComment | null;

  // 신고한 사용자 (회원 탈퇴 시 user_id를 null로 설정)
  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn() // user_id
  user: User | null;

  // 처리 완료 여부
  @Column({ default: false })
  isProcessed: boolean;

  // 처리 완료 일시
  @TimestampColumn({ nullable: true })
  processedAt: Temporal.Instant | null;

  // 처리 결과
  @Column({ type: "text", nullable: true })
  result: string | null;

  // 신고 처리자 (관리자)
  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn()
  processedBy: User | null;

  // 신고 일시
  @CreateTimestampColumn()
  createdAt: Temporal.Instant;
}
