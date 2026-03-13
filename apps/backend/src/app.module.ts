import { Module } from "@nestjs/common";
import { ConfigModule, ConfigType } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { databaseConfig, jwtConfig, redisConfig } from "./config";
import { RedisModule } from "./redis/redis.module";
import { MailModule } from "./mail/mail.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, jwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (db: ConfigType<typeof databaseConfig>) => ({
        type: "postgres",
        host: db.host,
        port: db.port,
        username: db.username,
        password: db.password,
        database: db.database,
        entities: [],
        synchronize: process.env.NODE_ENV !== "production",
      }),
    }),
    RedisModule,
    MailModule,
    UserModule,
  ],
})
export class AppModule {}
