import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Post } from "src/post/entities/post.entity";
import { User } from "src/user/entities/user.entity";
import { Temporal } from "@js-temporal/polyfill";
import {
  CreateTimestampColumn,
  TimestampColumn,
  UpdateTimestampColumn,
} from "src/database/decorators/temporal.decorators";

export enum DeletionType {
  AUTHOR = "AUTHOR",
  ADMIN = "ADMIN",
}

@Entity({ name: "post_comment" })
export class PostComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nickname: string;

  @Column({ type: "text" })
  content: string;

  @Column()
  postId: number;

  @ManyToOne(() => Post, { onDelete: "CASCADE" })
  @JoinColumn()
  post: Post;

  @Column({ nullable: true })
  authorId: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn()
  author: User | null;

  @CreateTimestampColumn()
  createdAt: Temporal.Instant;

  @UpdateTimestampColumn()
  updatedAt: Temporal.Instant;

  @TimestampColumn({ nullable: true })
  deletedAt: Temporal.Instant | null;

  @Column({ name: "deleted_by", nullable: true })
  deletedById: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "deleted_by" })
  deletedBy: User | null;

  @Column({
    type: "enum",
    enum: DeletionType,
    nullable: true,
  })
  deletionType: DeletionType | null;

  /**
   * active 상태, 즉 일반 사용자에게 보여지는 댓글인지 여부를 반환한다.
   * constraints: author relation이 로드되어야 한다.
   */
  isActive(): boolean {
    return this.deletedAt === null && this.author !== null;
  }
}
