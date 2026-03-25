import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Post } from "../post/post.entity";

@Entity({ name: "attachment" })
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  confirmed: boolean;

  @Column({ name: "s3_key" })
  s3Key: string;

  @Column({ type: "int", nullable: true })
  index: number | null;

  @ManyToOne(() => Post, (post) => post.attachments, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "post_id" })
  post: Post | null;
}
