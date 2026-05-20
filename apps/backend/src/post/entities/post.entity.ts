import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Temporal } from "@js-temporal/polyfill";
import {
  CreateTimestampColumn,
  UpdateTimestampColumn,
} from "src/database/decorators/temporal.decorators";
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

  @Column({ nullable: true })
  authorId: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn()
  author: User | null;

  @CreateTimestampColumn()
  createdAt: Temporal.Instant;

  @UpdateTimestampColumn()
  updatedAt: Temporal.Instant;

  @OneToMany(() => Attachment, (attachment) => attachment.post)
  attachments: Attachment[];

  @OneToMany(() => PostComment, (comment) => comment.post)
  comments: PostComment[];

  @Column({ default: 0 })
  likeCount: number;

  /**
   * active 상태, 즉 일반 사용자에게 보여지는 글인지 여부를 반환한다.
   * constraints: author relation이 로드되어야 한다.
   */
  isActive(): boolean {
    return this.author !== null;
  }
}
