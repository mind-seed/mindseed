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

  @Column()
  authorId: number;

  @ManyToOne(() => User)
  @JoinColumn()
  author: User;

  @CreateTimestampColumn()
  createdAt: Temporal.Instant;

  @UpdateTimestampColumn()
  updatedAt: Temporal.Instant;

  @TimestampColumn({ nullable: true })
  deletedAt: Temporal.Instant | null;

  @Column({ name: "deleted_by", nullable: true })
  deletedById: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "deleted_by" })
  deletedBy: User | null;

  @Column({
    type: "enum",
    enum: DeletionType,
    nullable: true,
  })
  deletionType: DeletionType | null;
}
