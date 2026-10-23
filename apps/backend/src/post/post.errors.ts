import { HttpStatus } from "@nestjs/common";
import { ServiceError } from "src/common/errors/service.error";
import { PostErrorCode, AttachmentErrorCode } from "@mindseed/api-types";

export class PostServiceError extends ServiceError {}

export class PostNotFoundError extends PostServiceError {
  constructor() {
    super(HttpStatus.NOT_FOUND, PostErrorCode.POST_NOT_FOUND);
  }
}

export class NotPostAuthorError extends PostServiceError {
  constructor() {
    super(HttpStatus.FORBIDDEN, PostErrorCode.NOT_POST_AUTHOR);
  }
}

export class AttachmentNotFoundError extends PostServiceError {
  constructor() {
    super(HttpStatus.BAD_REQUEST, AttachmentErrorCode.ATTACHMENT_NOT_FOUND);
  }
}

export class AttachmentAlreadyAssociatedError extends PostServiceError {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      AttachmentErrorCode.ATTACHMENT_ALREADY_ASSOCIATED,
    );
  }
}
