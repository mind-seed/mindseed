import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostComment } from "./entities/post-comment.entity";
import { Post } from "src/post/entities/post.entity";
import { CommentService } from "./comment.service";

@Module({
  imports: [TypeOrmModule.forFeature([PostComment, Post])],
  providers: [CommentService],
})
export class CommentModule {}
