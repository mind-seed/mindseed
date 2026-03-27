import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Post } from "./entities/post.entity";
import { PostLike } from "./entities/post-like.entity";
import { Attachment } from "../attachment/entities/attachment.entity";
import { PostQueryService } from "./post-query.service";
import { PostMutationService } from "./post-mutation.service";
import { PostController } from "./post.controller";
import { S3StorageModule } from "src/s3-storage/s3-storage.module";
import { AuthModule } from "src/auth/auth.module";
import { UserModule } from "src/user/user.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostLike, Attachment]),
    S3StorageModule,
    AuthModule,
    UserModule,
  ],
  controllers: [PostController],
  providers: [PostQueryService, PostMutationService],
})
export class PostModule {}
