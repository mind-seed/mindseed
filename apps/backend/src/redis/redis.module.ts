import { Module } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import Redis from "ioredis";
import { redisConfig } from "src/config";

export const REDIS_CLIENT = Symbol("REDIS_CLIENT");

@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [redisConfig.KEY],
      useFactory: (config: ConfigType<typeof redisConfig>) =>
        new Redis({
          host: config.host,
          port: config.port,
          password: config.password,
        }),
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
