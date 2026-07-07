import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Report } from "./entities/report.entity";
import { ReportPostController } from "./report.post.controller";
import { ReportService } from "./report.service";
import { AuthModule } from "src/auth/auth.module";
import { UserModule } from "src/user/user.module";
import { PostModule } from "src/post/post.module";
import { CommentModule } from "src/comment/comment.module";
import { ReportAdminController } from "./report.admin.controller";
import { ReportCommentController } from "./report.comment.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Report]),
    AuthModule,
    UserModule,
    PostModule,
    CommentModule,
  ],
  controllers: [
    ReportPostController,
    ReportAdminController,
    ReportCommentController,
  ],
  providers: [ReportService],
})
export class ReportModule {}
