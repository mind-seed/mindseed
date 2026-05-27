import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { EmailUsageType } from "../email-usage.types";

export class EmailTokenServiceError extends Error {}

export class InvalidEmailTokenTypeError extends EmailTokenServiceError {}

type EmailTokenPayload = {
  email: string;
  type: EmailUsageType;
};

const TOKEN_TTL = {
  [EmailUsageType.SIGN_UP]: "30m",
  [EmailUsageType.PASSWORD_RESET]: "15m",
} as const;

/**
 * email 인증 token JWT 발급/검증을 담당한다.
 * sign-up 및 password-reset 등 이메일 기반 인증 흐름에서 사용한다.
 */
@Injectable()
export class EmailTokenService {
  constructor(private readonly jwtService: JwtService) {}

  sign(email: string, type: EmailUsageType): string {
    const payload: EmailTokenPayload = { email, type };

    return this.jwtService.sign(payload, {
      expiresIn: TOKEN_TTL[type],
    });
  }

  decode(token: string): EmailTokenPayload {
    return this.jwtService.decode<EmailTokenPayload>(token);
  }

  verify(token: string, expectedType: EmailUsageType): EmailTokenPayload {
    const payload = this.jwtService.verify<EmailTokenPayload>(token);

    if (payload.type !== expectedType) {
      throw new InvalidEmailTokenTypeError();
    }

    return payload;
  }
}
