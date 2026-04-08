/*
 POST /mission-assignments/:id/complete
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { MissionAssignmentErrorCode } from "../common/error-codes";

export const CompleteMissionAssignmentResponseDtoSchema = responseDtoSchema(
  z.object({
    points: z.int(),
    level: z.int(),
  }),
  z.enum([
    MissionAssignmentErrorCode.MISSION_ASSIGNMENT_NOT_FOUND,
    MissionAssignmentErrorCode.MISSION_ASSIGNMENT_NOT_FOR_TODAY,
    MissionAssignmentErrorCode.MISSION_ASSIGNMENT_ALREADY_COMPLETED,
  ]),
);

export type CompleteMissionAssignmentResponseDto = z.output<
  typeof CompleteMissionAssignmentResponseDtoSchema
>;
export type CompleteMissionAssignmentSuccessResponseDto = Extract<
  CompleteMissionAssignmentResponseDto,
  { success: true }
>;
export type CompleteMissionAssignmentErrorResponseDto = Extract<
  CompleteMissionAssignmentResponseDto,
  { success: false }
>;
