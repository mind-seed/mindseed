import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "src/user/entities/user.entity";
import { Attachment } from "src/attachment/entities/attachment.entity";
import { PostComment } from "src/comment/entities/post-comment.entity";

export enum PostCategory {
  DUMMY1 = "DUMMY1",
  DUMMY2 = "DUMMY2",
  DUMMY3 = "DUMMY3",
}

@Entity({ name: "post" })
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text" })
  content: string;

  @Column({ type: "enum", enum: PostCategory })
  category: PostCategory;

  @Column()
  nickname: string;

  @Column({ name: "author_id" })
  authorId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "author_id" })
  author: User;

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => Attachment, (attachment) => attachment.post)
  attachments: Attachment[];

  @OneToMany(() => PostComment, (comment) => comment.post)
  comments: PostComment[];

  @Column({ name: "like_count", default: 0 })
  likeCount: number;
}
