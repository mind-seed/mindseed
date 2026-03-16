import { Inject, Injectable } from "@nestjs/common";
import { Redis } from "ioredis";
import { REDIS_CLIENT } from "src/redis/redis.module";

/**
 * user id에 대한 refresh token 저장을 위한 Redis wrapper class
 */
@Injectable()
export class RefreshTokenStore {
  static key(userId: number): string {
    return `refresh-token:${userId}`;
  }

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async save(userId: number, token: string, ttlSeconds: number): Promise<void> {
    await this.redis.set(
      RefreshTokenStore.key(userId),
      token,
      "EX",
      ttlSeconds,
    );
  }

  async find(userId: number): Promise<string | null> {
    return this.redis.get(RefreshTokenStore.key(userId));
  }

  async remove(userId: number): Promise<void> {
    await this.redis.del(RefreshTokenStore.key(userId));
  }
}
