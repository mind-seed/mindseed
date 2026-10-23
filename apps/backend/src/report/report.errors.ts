import { HttpStatus } from "@nestjs/common";
import { ServiceError } from "src/common/errors/service.error";
import { ReportErrorCode } from "@mindseed/api-types";

export class ReportError extends ServiceError {}

export class ReportReasonEmptyError extends ReportError {
  constructor() {
    super(HttpStatus.BAD_REQUEST, ReportErrorCode.REPORT_REASON_EMPTY);
  }
}

export class ReportNotFoundError extends ReportError {
  constructor() {
    super(HttpStatus.NOT_FOUND, ReportErrorCode.REPORT_NOT_FOUND);
  }
}
