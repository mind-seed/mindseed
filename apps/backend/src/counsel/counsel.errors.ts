import { HttpStatus } from "@nestjs/common";
import { ServiceError } from "src/common/errors/service.error";
import { CounselErrorCode } from "@mindseed/api-types";

export class CounselServiceError extends ServiceError {}

export class CounselNotFoundError extends CounselServiceError {
  constructor() {
    super(HttpStatus.NOT_FOUND, CounselErrorCode.COUNSEL_NOT_FOUND);
  }
}

export class NotCounselAuthorError extends CounselServiceError {
  constructor() {
    super(HttpStatus.FORBIDDEN, CounselErrorCode.NOT_COUNSEL_AUTHOR);
  }
}

export class CounselAlreadyRespondedError extends CounselServiceError {
  constructor() {
    super(HttpStatus.CONFLICT, CounselErrorCode.COUNSEL_ALREADY_RESPONDED);
  }
}
