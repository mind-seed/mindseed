import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "../post/post.entity";

@Entity()
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  confirmed: boolean;

  @Column()
  s3Key: string;

  @Column({ type: "int", nullable: true })
  index: number | null;

  @ManyToOne(() => Post, (post) => post.attachments, { nullable: true })
  post: Post | null;
}
