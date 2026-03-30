import { HttpStatus } from "@nestjs/common";
import { ServiceError } from "src/common/errors/service.error";

export class CommentError extends ServiceError {}

export class CommentNotFoundError extends ServiceError {
  constructor() {
    super(HttpStatus.NOT_FOUND, "COMMENT_NOT_FOUND");
  }
}

export class NotCommentAuthorError extends ServiceError {
  constructor() {
    super(HttpStatus.FORBIDDEN, "NOT_COMMENT_AUTHOR");
  }
}
