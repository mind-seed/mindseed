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

  @Column({ name: "post_id" })
  postId: number;

  @ManyToOne(() => Post, { onDelete: "CASCADE" })
  @JoinColumn({ name: "post_id" })
  post: Post;

  @Column({ name: "author_id" })
  authorId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "author_id" })
  author: User;

  @CreateTimestampColumn({ name: "created_at" })
  createdAt: Temporal.Instant;

  @UpdateTimestampColumn({ name: "updated_at" })
  updatedAt: Temporal.Instant;

  @TimestampColumn({
    name: "deleted_at",
    nullable: true,
  })
  deletedAt: Temporal.Instant | null;

  @Column({ name: "deleted_by", nullable: true })
  deletedById: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "deleted_by" })
  deletedBy: User | null;

  @Column({
    type: "enum",
    enum: DeletionType,
    name: "deletion_type",
    nullable: true,
  })
  deletionType: DeletionType | null;
}
