import { HttpStatus } from "@nestjs/common";
import { ServiceError } from "src/common/errors/service.error";

export class AuthServiceError extends ServiceError {}

export class EmailRateLimitedError extends AuthServiceError {
  constructor() {
    super(HttpStatus.TOO_MANY_REQUESTS, "EMAIL_RATE_LIMITED");
  }
}

export class VerificationCooldownError extends AuthServiceError {
  constructor() {
    super(HttpStatus.TOO_MANY_REQUESTS, "VERIFICATION_COOLDOWN");
  }
}

export class EmailAlreadyExistsError extends AuthServiceError {
  constructor() {
    super(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS");
  }
}

export class InvalidVerificationCodeError extends AuthServiceError {
  constructor() {
    super(HttpStatus.BAD_REQUEST, "INVALID_VERIFICATION_CODE");
  }
}

export class InvalidSignUpTokenError extends AuthServiceError {
  constructor() {
    super(HttpStatus.UNAUTHORIZED, "INVALID_SIGN_UP_TOKEN");
  }
}

export class InvalidCredentialsError extends AuthServiceError {
  constructor() {
    super(HttpStatus.BAD_REQUEST, "INVALID_CREDENTIALS");
  }
}

export class InvalidRefreshTokenError extends AuthServiceError {
  constructor() {
    super(HttpStatus.BAD_REQUEST, "INVALID_REFRESH_TOKEN");
  }
}
