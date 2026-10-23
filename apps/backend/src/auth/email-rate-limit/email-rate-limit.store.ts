import { Inject, Injectable } from "@nestjs/common";
import { Redis } from "ioredis";
import { REDIS_CLIENT } from "src/redis/redis.module";

/**
 * rate limit counter를 expiry와 함께 저장하는 Redis wrapper class
 */
@Injectable()
export class EmailRateLimitStore {
  static key(identifier: string, window: number): string {
    return `email-rate-limit:${identifier}:${window}`;
  }

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async increment(
    email: string,
    window: number,
    windowSizeMs: number,
  ): Promise<number> {
    const key = EmailRateLimitStore.key(email, window);
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, windowSizeMs);
    }
    return count;
  }

  async count(email: string, window: number): Promise<number> {
    return Number(
      (await this.redis.get(EmailRateLimitStore.key(email, window))) ?? 0,
    );
  }
}
