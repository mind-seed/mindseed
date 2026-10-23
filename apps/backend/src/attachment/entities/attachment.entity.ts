import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Post } from "src/post/entities/post.entity";

@Entity({ name: "attachment" })
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  confirmed: boolean;

  @Column()
  s3Key: string;

  @Column({ type: "int", nullable: true })
  index: number | null;

  @Column({ nullable: true })
  postId: number | null;

  @ManyToOne(() => Post, (post) => post.attachments, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn()
  post: Post | null;
}
