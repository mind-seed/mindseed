import { Injectable } from "@nestjs/common";
import { VerificationCodeStore } from "./verification-code.store";
import { hashVerificationCode } from "./hash-verification-code.helper";

const COOLDOWN_SECONDS = 30;
const TTL_SECONDS = 3 * 60; // 3 minutes
const CODE_LENGTH = 6;

export class VerificationCodeServiceError extends Error {}

@Injectable()
export class VerificationCodeService {
  constructor(private readonly verificationCodeStore: VerificationCodeStore) {}

  /**
   * email에 대한 code를 hash하여 현재 timestamp와 함께 저장한다.
   * cooldown 중일 시 throw 한다.
   * @returns 생성된 code
   */
  async issue(email: string): Promise<string> {
    if (await this.isInCooldown(email)) {
      throw new VerificationCodeServiceError();
    }

    const code = Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(CODE_LENGTH, "0");
    const hashedCode = hashVerificationCode(code);

    await this.verificationCodeStore.save(email, hashedCode, TTL_SECONDS);

    return code;
  }

  /**
   * email에 대한 code의 일치 여부를 반환한다.
   */
  async validate(email: string, code: string): Promise<boolean> {
    // SHA-256은 deterministic 하므로, 바로 비교해도 된다.
    const entry = await this.verificationCodeStore.find(email);
    if (!entry) {
      return false;
    }

    const hashedCode = hashVerificationCode(code);
    return hashedCode === entry.hashedCode;
  }

  /**
   * email에 대한 entry를 삭제한다.
   * 해당 entry가 존재하지 않을 시 throw 한다.
   */
  async revoke(email: string): Promise<void> {
    if (!(await this.exists(email))) {
      throw new VerificationCodeServiceError();
    }
    await this.verificationCodeStore.remove(email);
  }

  /*
   * email에 대한 entry의 존재 여부를 반환한다.
   */
  async exists(email: string): Promise<boolean> {
    return !!(await this.verificationCodeStore.find(email));
  }

  /*
   * email에 대한 entry의 cooldown 여부를 반환한다.
   * entry가 존재하지 않을 시 false를 반환한다.
   */
  async isInCooldown(email: string): Promise<boolean> {
    const entry = await this.verificationCodeStore.find(email);
    if (!entry) {
      return false;
    }

    return (Date.now() - entry?.issuedAt) / 1000 < COOLDOWN_SECONDS;
  }
}
