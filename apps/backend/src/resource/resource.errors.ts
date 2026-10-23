import { HttpStatus } from "@nestjs/common";
import { ServiceError } from "src/common/errors/service.error";
import { ResourceErrorCode } from "@mindseed/api-types";

export class ResourceServiceError extends ServiceError {}

export class ResourceNotFoundError extends ResourceServiceError {
  constructor() {
    super(HttpStatus.NOT_FOUND, ResourceErrorCode.RESOURCE_NOT_FOUND);
  }
}
