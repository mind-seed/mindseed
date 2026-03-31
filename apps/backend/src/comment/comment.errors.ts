import { HttpStatus } from "@nestjs/common";
import { ServiceError } from "src/common/errors/service.error";
import { CommentErrorCode } from "@mindseed/api-types";

export class CommentError extends ServiceError {}

export class CommentNotFoundError extends ServiceError {
  constructor() {
    super(HttpStatus.NOT_FOUND, CommentErrorCode.COMMENT_NOT_FOUND);
  }
}

export class NotCommentAuthorError extends ServiceError {
  constructor() {
    super(HttpStatus.FORBIDDEN, CommentErrorCode.NOT_COMMENT_AUTHOR);
  }
}
