import { HttpStatus } from "@nestjs/common";
import { ServiceError } from "src/common/errors/service.error";
import {
  MissionErrorCode,
  MissionAssignmentErrorCode,
} from "@mindseed/api-types";

export class MissionServiceError extends ServiceError {}

export class MissionNotFoundError extends MissionServiceError {
  constructor() {
    super(HttpStatus.NOT_FOUND, MissionErrorCode.MISSION_NOT_FOUND);
  }
}

export class MissionAssignmentNotFoundError extends MissionServiceError {
  constructor() {
    super(
      HttpStatus.NOT_FOUND,
      MissionAssignmentErrorCode.MISSION_ASSIGNMENT_NOT_FOUND,
    );
  }
}

export class MissionAssignmentNotForDateError extends MissionServiceError {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      MissionAssignmentErrorCode.MISSION_ASSIGNMENT_NOT_FOR_TODAY,
    );
  }
}

export class MissionAssignmentAlreadyCompletedError extends MissionServiceError {
  constructor() {
    super(
      HttpStatus.BAD_REQUEST,
      MissionAssignmentErrorCode.MISSION_ASSIGNMENT_ALREADY_COMPLETED,
    );
  }
}
