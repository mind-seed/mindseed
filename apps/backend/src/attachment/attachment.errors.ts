import { HttpStatus } from "@nestjs/common";
import { ServiceError } from "src/common/errors/service.error";
import { AttachmentErrorCode } from "@mindseed/api-types";

export class AttachmentServiceError extends ServiceError {}

export class AttachmentNotFoundError extends AttachmentServiceError {
  constructor() {
    super(HttpStatus.NOT_FOUND, AttachmentErrorCode.ATTACHMENT_NOT_FOUND);
  }
}

export class AttachmentAlreadyConfirmedError extends AttachmentServiceError {
  constructor() {
    super(
      HttpStatus.CONFLICT,
      AttachmentErrorCode.ATTACHMENT_ALREADY_CONFIRMED,
    );
  }
}

export class AttachmentNotUploadedError extends AttachmentServiceError {
  constructor() {
    super(HttpStatus.BAD_REQUEST, AttachmentErrorCode.ATTACHMENT_NOT_UPLOADED);
  }
}
