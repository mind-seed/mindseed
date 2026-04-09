import { Module } from "@nestjs/common";
import { ConfigModule, ConfigType } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  databaseConfig,
  jwtConfig,
  mailConfig,
  redisConfig,
  s3Config,
} from "./config";
import { RedisModule } from "./redis/redis.module";
import { MailModule } from "./mail/mail.module";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { User } from "./user/entities/user.entity";
import { UserProfile } from "./user/entities/user-profile.entity";
import { RefreshToken } from "./auth/refresh-token/refresh-token.entity";
import { ScheduleModule } from "@nestjs/schedule";
import { UserController } from "./user/user.controller";
import { S3StorageModule } from "./s3-storage/s3-storage.module";
import { AttachmentModule } from "./attachment/attachment.module";
import { PostModule } from "./post/post.module";
import { Post } from "./post/entities/post.entity";
import { Attachment } from "./attachment/entities/attachment.entity";
import { PostLike } from "./post/entities/post-like.entity";
import { CommentModule } from "./comment/comment.module";
import { PostComment } from "./comment/entities/post-comment.entity";
import { ResourceModule } from "./resource/resource.module";
import { Resource } from "./resource/entities/resource.entity";
import { MissionModule } from "./mission/mission.module";
import { Mission } from "./mission/entities/mission.entity";
import { MissionAssignment } from "./mission/entities/mission-assignment.entity";
import { DiagnosisModule } from "./diagnosis/diagnosis.module";
import { DiagnosisEntry } from "./diagnosis/entities/diagnosis-entry.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, jwtConfig, mailConfig, s3Config],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (db: ConfigType<typeof databaseConfig>) => ({
        type: "postgres",
        host: db.host,
        port: db.port,
        username: db.username,
        password: db.password,
        database: db.database,
        entities: [
          Attachment,
          User,
          UserProfile,
          RefreshToken,
          Post,
          PostComment,
          PostLike,
          Resource,
          Mission,
          MissionAssignment,
          DiagnosisEntry,
        ],
        synchronize: process.env.NODE_ENV !== "production",
      }),
    }),
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
