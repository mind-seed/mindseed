import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "src/post/entities/post.entity";
import { User } from "src/user/entities/user.entity";

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

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updatedAt: Date;

  @Column({ type: "timestamptz", name: "deleted_at", nullable: true })
  deletedAt: Date | null;

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
