import { HttpStatus } from "@nestjs/common";
import { DiagnosisErrorCode } from "@mindseed/api-types";
import { ServiceError } from "src/common/errors/service.error";

export class DiagnosisServiceError extends ServiceError {}

export class DiagnosisNotFoundError extends DiagnosisServiceError {
  constructor() {
    super(HttpStatus.NOT_FOUND, DiagnosisErrorCode.DIAGNOSIS_NOT_FOUND);
  }
}
