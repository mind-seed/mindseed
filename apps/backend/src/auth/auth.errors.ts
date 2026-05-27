import { HttpStatus } from "@nestjs/common";
import { ServiceError } from "src/common/errors/service.error";
import { AuthErrorCode } from "@mindseed/api-types";

export class AuthServiceError extends ServiceError {}

export class EmailRateLimitedError extends AuthServiceError {
  constructor() {
    super(HttpStatus.TOO_MANY_REQUESTS, AuthErrorCode.EMAIL_RATE_LIMITED);
  }
}

export class VerificationCooldownError extends AuthServiceError {
  constructor() {
    super(HttpStatus.TOO_MANY_REQUESTS, AuthErrorCode.VERIFICATION_COOLDOWN);
  }
}

export class EmailAlreadyExistsError extends AuthServiceError {
  constructor() {
    super(HttpStatus.CONFLICT, AuthErrorCode.EMAIL_ALREADY_EXISTS);
  }
}

export class InvalidVerificationCodeError extends AuthServiceError {
  constructor() {
    super(HttpStatus.BAD_REQUEST, AuthErrorCode.INVALID_VERIFICATION_CODE);
  }
}

export class InvalidSignUpTokenError extends AuthServiceError {
  constructor() {
    super(HttpStatus.UNAUTHORIZED, AuthErrorCode.INVALID_SIGN_UP_TOKEN);
  }
}

export class InvalidCredentialsError extends AuthServiceError {
  constructor() {
    super(HttpStatus.BAD_REQUEST, AuthErrorCode.INVALID_CREDENTIALS);
  }
}

export class InvalidRefreshTokenError extends AuthServiceError {
  constructor() {
    super(HttpStatus.BAD_REQUEST, AuthErrorCode.INVALID_REFRESH_TOKEN);
  }
}

export class InvalidPasswordResetTokenError extends AuthServiceError {
  constructor() {
    super(HttpStatus.UNAUTHORIZED, AuthErrorCode.INVALID_PASSWORD_RESET_TOKEN);
  }
}
