import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { EmailRateLimitService } from "./email-rate-limit/email-rate-limit.service";
import { VerificationCodeService } from "./verification-code/verification-code.service";
import { MailService } from "src/mail/mail.service";
import { UserService } from "src/user/user.service";
import { SignUpTokenService } from "./sign-up-token/sign-up-token.service";
import { AccessTokenService } from "./access-token/access-token.service";
import { RefreshTokenService } from "./refresh-token/refresh-token.service";
import { JsonWebTokenError } from "@nestjs/jwt";

export type SignUpResult = {
  accessToken: string;
  refreshToken: string;
};

export class AuthServiceError extends Error {}
export class EmailRateLimitedError extends AuthServiceError {}
export class VerificationCooldownError extends AuthServiceError {}
export class EmailAlreadyExistsError extends AuthServiceError {}
export class InvalidVerificationCodeError extends AuthServiceError {}
export class InvalidSignUpTokenError extends AuthServiceError {}

@Injectable()
export class AuthService {
  constructor(
    private readonly emailRateLimitService: EmailRateLimitService,
    private readonly verificationCodeService: VerificationCodeService,
    private readonly signUpTokenService: SignUpTokenService,
    private readonly mailService: MailService,
    private readonly userService: UserService,
    private readonly accessTokenService: AccessTokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  /**
   * email로 인증 코드를 발송하며, 해당 인증 코드를 저장한다.
   */
  async sendVerificationMail(email: string): Promise<void> {
    if (await this.emailRateLimitService.isLimited(email)) {
      throw new EmailRateLimitedError();
    }

    if (await this.verificationCodeService.isInCooldown(email)) {
      throw new VerificationCooldownError();
    }

    if (await this.userService.findByEmail(email)) {
      throw new EmailAlreadyExistsError();
    }

    const code = await this.verificationCodeService.issue(email);

    try {
      await this.mailService.sendVerificationEmail(email, code);
    } catch (error) {
      await this.verificationCodeService.revoke(email);
      throw error;
    }

    // ignore errors - rate limit은 실패해도 중요하지 않다.
    await this.emailRateLimitService.increment(email).catch();
  }

  /**
   * email과 code를 이용해 인증 코드를 검증하고, 성공 시 회원가입 token을 발급한다.
   * @returns 회원가입 token
   */
  async verifyMail(email: string, code: string): Promise<string> {
    if (!(await this.verificationCodeService.validate(email, code))) {
      throw new InvalidVerificationCodeError();
    }

    const token = this.signUpTokenService.sign(email);

    await this.verificationCodeService.revoke(email);

    return token;
  }

  /**
   * 회원가입 token인 signUpToken에 대하여 회원가입을 진행한다.
   * @returns access token 및 refresh token
   */
  async completeSignup(
    signUpToken: string,
    password: string,
    nickname: string,
    age: number,
  ): Promise<SignUpResult> {
    let email: string;

    try {
      const payload = this.signUpTokenService.verify(signUpToken);
      email = payload.email;
    } catch (error) {
      // verification failure
      if (error instanceof JsonWebTokenError) {
        throw new InvalidSignUpTokenError();
      }
      throw error;
    }

    if (await this.userService.findByEmail(email)) {
      throw new EmailAlreadyExistsError();
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await this.userService.create(email, hashedPassword, {
      nickname,
      age,
    });
    const accessToken = this.accessTokenService.sign(user.id);
    const refreshToken = await this.refreshTokenService.issue(user.id);

    return { accessToken, refreshToken };
  }
}
