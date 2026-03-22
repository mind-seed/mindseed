import { HttpStatus } from "@nestjs/common";
import { ServiceError } from "src/common/errors/service.error";

export class AttachmentServiceError extends ServiceError {}

export class AttachmentNotFoundError extends AttachmentServiceError {
  constructor() { super(HttpStatus.NOT_FOUND, "ATTACHMENT_NOT_FOUND"); }
}

export class AttachmentAlreadyConfirmedError extends AttachmentServiceError {
  constructor() { super(HttpStatus.CONFLICT, "ATTACHMENT_ALREADY_CONFIRMED"); }
}

export class AttachmentNotUploadedError extends AttachmentServiceError {
  constructor() { super(HttpStatus.BAD_REQUEST, "ATTACHMENT_NOT_UPLOADED"); }
}
