import { HttpStatus } from "@nestjs/common";
import { ServiceError } from "src/common/errors/service.error";

export class PostServiceError extends ServiceError {}

export class PostNotFoundError extends PostServiceError {
  constructor() {
    super(HttpStatus.NOT_FOUND, "POST_NOT_FOUND");
  }
}

export class InvalidCursorError extends PostServiceError {
  constructor() {
    super(HttpStatus.BAD_REQUEST, "INVALID_CURSOR");
  }
}

export class NotPostAuthorError extends PostServiceError {
  constructor() {
    super(HttpStatus.FORBIDDEN, "NOT_POST_AUTHOR");
  }
}

export class AttachmentNotFoundError extends PostServiceError {
  constructor() {
    super(HttpStatus.BAD_REQUEST, "ATTACHMENT_NOT_FOUND");
  }
}

export class AttachmentAlreadyAssociatedError extends PostServiceError {
  constructor() {
    super(HttpStatus.BAD_REQUEST, "ATTACHMENT_ALREADY_ASSOCIATED");
  }
}
