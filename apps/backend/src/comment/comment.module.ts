import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostComment } from "./entities/post-comment.entity";
import { CommentService } from "./comment.service";

@Module({
  imports: [TypeOrmModule.forFeature([PostComment])],
  providers: [CommentService],
})
export class CommentModule {}
