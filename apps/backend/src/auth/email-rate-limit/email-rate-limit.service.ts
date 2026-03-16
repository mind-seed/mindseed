import { Injectable } from "@nestjs/common";
import { EmailRateLimitStore } from "./email-rate-limit.store";

/**
 * 현재 시간을 기준으로 email에 대한 rate limit을 관리한다.
 * fixed window 방식을 사용한다.
 */
@Injectable()
export class EmailRateLimitService {
  static WINDOW_MS = 1000 * 60 * 60; // 1 hour
  static RATE_LIMIT_COUNT = 5;
  static RATE_LIMIT_IDENTIFIER = "email";

  constructor(private readonly store: EmailRateLimitStore) {}

  async isLimited(email: string): Promise<boolean> {
    const count = await this.store.count(email, this.getWindowForNow());
    return count >= EmailRateLimitService.RATE_LIMIT_COUNT;
  }

  async increment(email: string): Promise<void> {
    await this.store.increment(
      email,
      this.getWindowForNow(),
      EmailRateLimitService.WINDOW_MS,
    );
  }

  private getWindowForNow(): number {
    return Math.floor(Date.now() / EmailRateLimitService.WINDOW_MS);
  }
}
