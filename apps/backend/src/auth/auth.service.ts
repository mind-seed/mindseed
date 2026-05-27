import { Injectable } from "@nestjs/common";
import { EmailRateLimitService } from "./email-rate-limit/email-rate-limit.service";
import { VerificationCodeService } from "./verification-code/verification-code.service";
import { MailService } from "src/mail/mail.service";
import { UserService } from "src/user/user.service";
import {
  EmailTokenService,
  EmailTokenServiceError,
} from "./email-token/email-token.service";
import { AccessTokenService } from "./access-token/access-token.service";
import { RefreshTokenService } from "./refresh-token/refresh-token.service";
import { JsonWebTokenError } from "@nestjs/jwt";
import { bcryptHash, bcryptCompare } from "./bcrypt.helper";
import {
  EmailAlreadyExistsError,
  EmailRateLimitedError,
  InvalidCredentialsError,
  InvalidPasswordResetTokenError,
  InvalidRefreshTokenError,
  InvalidSignUpTokenError,
  InvalidVerificationCodeError,
  VerificationCooldownError,
} from "./auth.errors";
import { EmailUsageType } from "./email-usage.types";

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

/**
 * AuthController와 1:1로 대응되는, auth 관련 orchestration logic을
 * 담당한다.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly emailRateLimitService: EmailRateLimitService,
    private readonly verificationCodeService: VerificationCodeService,
    private readonly emailTokenService: EmailTokenService,
    private readonly mailService: MailService,
    private readonly userService: UserService,
    private readonly accessTokenService: AccessTokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  /**
   * email로 회원가입용 인증 코드를 발송하며, 해당 인증 코드를 저장한다.
   */
  async sendSignUpVerificationMail(email: string): Promise<void> {
    if (await this.userService.findByEmail(email)) {
      throw new EmailAlreadyExistsError();
    }

    await this.sendVerificationMail(email, EmailUsageType.SIGN_UP);
  }

  /**
   * email로 비밀번호 변경용 인증 코드를 발송하며, 해당 인증 코드를 저장한다.
   */
  async sendPasswordResetVerificationMail(email: string): Promise<void> {
    if (!(await this.userService.findByEmail(email))) {
      return;
    }

    await this.sendVerificationMail(email, EmailUsageType.PASSWORD_RESET);
  }

  /**
   * email과 code를 이용해 인증 코드를 검증하고, 성공 시 해당 코드에 해당하는
   * email token을 발급한다.
   * @returns 회원가입용 email token
   */
  async verifyMail(email: string, code: string): Promise<string> {
    const payload = await this.verificationCodeService.verify(email, code);
    if (!payload) {
      throw new InvalidVerificationCodeError();
    }

    const token = this.emailTokenService.sign(email, payload.type);

    await this.verificationCodeService.revoke(email);

    return token;
  }

  /**
   * 회원가입용 email token 대하여 회원가입을 진행한다.
   * @returns access token 및 refresh token
   */
  async signUp(
    signUpToken: string,
    password: string,
    nickname: string,
    age: number,
  ): Promise<TokenPair> {
    let email: string;

    try {
      const payload = this.emailTokenService.verify(
        signUpToken,
        EmailUsageType.SIGN_UP,
      );
      email = payload.email;
    } catch (error) {
      // verification failure
      if (
        error instanceof JsonWebTokenError ||
        error instanceof EmailTokenServiceError
      ) {
        throw new InvalidSignUpTokenError();
      }
      throw error;
    }

    if (await this.userService.findByEmail(email)) {
      throw new EmailAlreadyExistsError();
    }

    const hashedPassword = await bcryptHash(password);
    const user = await this.userService.create(email, hashedPassword, {
      nickname,
      age,
    });
    const accessToken = this.accessTokenService.sign(user.id);
    const refreshToken = await this.refreshTokenService.issue(user.id);

    return { accessToken, refreshToken };
  }

  /**
   * email과 password를 이용해 로그인을 시도한다.
   * @returns access token 및 refresh token
   */
  async login(email: string, password: string): Promise<TokenPair> {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new InvalidCredentialsError();

    if (!(await bcryptCompare(password, user.password))) {
      throw new InvalidCredentialsError();
    }

    const accessToken = this.accessTokenService.sign(user.id);
    const refreshToken = await this.refreshTokenService.issue(user.id);

    return { accessToken, refreshToken };
  }

  /**
   * userId에 해당하는 사용자의 로그아웃을 처리한다.
   */
  async logout(userId: number): Promise<void> {
    await this.refreshTokenService.revoke(userId);
  }

  /**
   * refreshToken을 이용하여 새로운 access token 및 refresh token을 발급한다.
   * @returns access token 및 refresh token
   */
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    const userId =
      await this.refreshTokenService.findUserIdByToken(refreshToken);
    if (!userId) {
      throw new InvalidRefreshTokenError();
    }

    const accessToken = this.accessTokenService.sign(userId);
    const newRefreshToken = await this.refreshTokenService.rotate(userId);

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * password-reset email token을 이용해 비밀번호를 변경한다.
   */
  async resetPassword(token: string, password: string): Promise<void> {
    let email: string;

    try {
      const payload = this.emailTokenService.verify(
        token,
        EmailUsageType.PASSWORD_RESET,
      );
      email = payload.email;
    } catch (error) {
      if (
        error instanceof JsonWebTokenError ||
        error instanceof EmailTokenServiceError
      ) {
        throw new InvalidPasswordResetTokenError();
      }
      throw error;
    }

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new InvalidPasswordResetTokenError();
    }

    await this.refreshTokenService.revoke(user.id);

    const hashedPassword = await bcryptHash(password);
    await this.userService.updatePassword(user.id, hashedPassword);
  }

  private async sendVerificationMail(
    email: string,
    type: EmailUsageType,
  ): Promise<void> {
    if (await this.emailRateLimitService.isLimited(email)) {
      throw new EmailRateLimitedError();
    }

    if (await this.verificationCodeService.isInCooldown(email)) {
      throw new VerificationCooldownError();
    }

    const code = await this.verificationCodeService.issue(email, {
      type,
    });

    try {
      await this.mailService.sendVerificationEmail(email, code);
    } catch (error) {
      await this.verificationCodeService.revoke(email);
      throw error;
    }

    // ignore errors - rate limit은 실패해도 중요하지 않다.
    await this.emailRateLimitService.increment(email).catch();
  }
}
