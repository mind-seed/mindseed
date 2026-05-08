import { Module } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { databaseConfig } from "src/config";
import { User } from "src/user/entities/user.entity";
import { UserProfile } from "src/user/entities/user-profile.entity";
import { RefreshToken } from "src/auth/refresh-token/refresh-token.entity";
import { Attachment } from "src/attachment/entities/attachment.entity";
import { Post } from "src/post/entities/post.entity";
import { PostComment } from "src/comment/entities/post-comment.entity";
import { PostLike } from "src/post/entities/post-like.entity";
import { Resource } from "src/resource/entities/resource.entity";
import { Mission } from "src/mission/entities/mission.entity";
import { MissionAssignment } from "src/mission/entities/mission-assignment.entity";
import { DiagnosisEntry } from "src/diagnosis/entities/diagnosis-entry.entity";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { CounselEntry } from "src/counsel/entities/counsel-entry.entity";

@Module({
  imports: [
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
          CounselEntry,
          DiagnosisEntry,
          Mission,
          MissionAssignment,
          Post,
          PostComment,
          PostLike,
          RefreshToken,
          Resource,
          User,
          UserProfile,
        ],
        synchronize: process.env.NODE_ENV !== "production",
        namingStrategy: new SnakeNamingStrategy(),
      }),
    }),
  ],
})
export class DatabaseModule {}
