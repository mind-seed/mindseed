import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from "@nestjs/common";
import type { Response } from "express";
import {
  AuthServiceError,
  EmailRateLimitedError,
  VerificationCooldownError,
  EmailAlreadyExistsError,
  InvalidVerificationCodeError,
  InvalidSignUpTokenError,
} from "src/auth/auth.service";

// 2026-03-13: 이후에 다른 service에서도 공통된 로직으로 filter 작성 시
// ExceptionFilter의 factory 방식도 가능할 듯 합니다

type ErrorEntry = { statusCode: number; errorCode: string };

const AUTH_ERROR_MAP = new Map<
  new (...args: any[]) => AuthServiceError,
  ErrorEntry
>([
  [
    EmailRateLimitedError,
    {
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      errorCode: "EMAIL_RATE_LIMITED",
    },
  ],
  [
    VerificationCooldownError,
    {
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      errorCode: "VERIFICATION_COOLDOWN",
    },
  ],
  [
    EmailAlreadyExistsError,
    { statusCode: HttpStatus.CONFLICT, errorCode: "EMAIL_ALREADY_EXISTS" },
  ],
  [
    InvalidVerificationCodeError,
    {
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      errorCode: "INVALID_VERIFICATION_CODE",
    },
  ],
  [
    InvalidSignUpTokenError,
    { statusCode: HttpStatus.UNAUTHORIZED, errorCode: "INVALID_SIGN_UP_TOKEN" },
  ],
]);

@Catch(AuthServiceError)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: AuthServiceError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const entry = AUTH_ERROR_MAP.get(
      exception.constructor as new (...args: any[]) => AuthServiceError,
    );

    if (entry) {
      return res.status(entry.statusCode).json({
        success: false,
        statusCode: entry.statusCode,
        errorCode: entry.errorCode,
      });
    }

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
}
