import { Inject, Injectable } from "@nestjs/common";
import { Redis } from "ioredis";
import { REDIS_CLIENT } from "src/redis/redis.module";

export interface VerificationEntry {
  hashedCode: string;
  issuedAt: number;
}

/**
 * hashed verification code의 storing을 담당하는 Redis wrapper class
 */
@Injectable()
export class VerificationCodeStore {
  static key(email: string): string {
    return `verification:${email}`;
  }

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async save(
    email: string,
    hashedCode: string,
    ttlSeconds: number,
  ): Promise<void> {
    const key = VerificationCodeStore.key(email);
    await this.redis
      .pipeline()
      .hset(key, { hashedCode, issuedAt: Date.now() })
      .expire(key, ttlSeconds)
      .exec();
  }

  async find(email: string): Promise<VerificationEntry | null> {
    const result = await this.redis.hgetall(VerificationCodeStore.key(email));
    if (!result || !result.hashedCode) return null;
    return {
      hashedCode: result.hashedCode,
      issuedAt: Number(result.issuedAt),
    };
  }

  async remove(email: string): Promise<void> {
    await this.redis.del(VerificationCodeStore.key(email));
  }
}
