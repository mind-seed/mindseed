import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostComment } from "./entities/post-comment.entity";
import { Post } from "src/post/entities/post.entity";
import { CommentService } from "./comment.service";
import { CommentController } from "./comment.controller";
import { AuthModule } from "src/auth/auth.module";
import { UserModule } from "src/user/user.module";
import { CommentAdminController } from "./comment-admin.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([PostComment, Post]),
    AuthModule,
    UserModule,
  ],
  controllers: [CommentController, CommentAdminController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
