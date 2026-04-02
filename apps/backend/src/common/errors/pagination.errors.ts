import { HttpStatus } from "@nestjs/common";
import { PaginationErrorCode } from "@mindseed/api-types";
import { ServiceError } from "./service.error";

export class InvalidCursorError extends ServiceError {
  constructor() {
    super(HttpStatus.BAD_REQUEST, PaginationErrorCode.INVALID_CURSOR);
  }
}
