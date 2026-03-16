import { Module } from "@nestjs/common";
import { ConfigModule, ConfigType } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { databaseConfig, jwtConfig, redisConfig } from "./config";
import { RedisModule } from "./redis/redis.module";
import { MailModule } from "./mail/mail.module";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { User } from "./user/user.entity";
import { UserProfile } from "./user/user-profile.entity";
import { RefreshToken } from "./auth/refresh-token/refresh-token.entity";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, jwtConfig],
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
        entities: [User, UserProfile, RefreshToken],
        synchronize: process.env.NODE_ENV !== "production",
      }),
    }),
    RedisModule,
    MailModule,

    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
