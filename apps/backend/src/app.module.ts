import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import {
  databaseConfig,
  jwtConfig,
  mailConfig,
  redisConfig,
  s3Config,
} from "./config";
import { DatabaseModule } from "./database/database.module";
import { RedisModule } from "./redis/redis.module";
import { MailModule } from "./mail/mail.module";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { ScheduleModule } from "@nestjs/schedule";
import { UserController } from "./user/user.controller";
import { S3StorageModule } from "./s3-storage/s3-storage.module";
import { AttachmentModule } from "./attachment/attachment.module";
import { PostModule } from "./post/post.module";
import { CommentModule } from "./comment/comment.module";
import { ResourceModule } from "./resource/resource.module";
import { MissionModule } from "./mission/mission.module";
import { DiagnosisModule } from "./diagnosis/diagnosis.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, jwtConfig, mailConfig, s3Config],
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    RedisModule,
    MailModule,
    S3StorageModule,
    AuthModule,
    UserModule,
    AttachmentModule,
    PostModule,
    CommentModule,
    ResourceModule,
    MissionModule,
    DiagnosisModule,
  ],
  // 2026-03-18: AuthGuard -- UserService circular dependency 문제를 해결하기
  // 위해 다음과 같이 배치하였습니다.
  controllers: [UserController],
})
export class AppModule {}
