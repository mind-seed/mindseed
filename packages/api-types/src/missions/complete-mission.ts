/*
 POST /missions/:id/complete
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { MissionErrorCode } from "../common/error-codes";

export const CompleteMissionResponseDtoSchema = responseDtoSchema(
  z.object({
    points: z.int(),
    level: z.int(),
  }),
  z.enum([
    MissionErrorCode.MISSION_NOT_FOUND,
    MissionErrorCode.MISSION_NOT_FOR_TODAY,
    MissionErrorCode.MISSION_ALREADY_COMPLETED,
  ]),
);

export type CompleteMissionResponseDto = z.output<
  typeof CompleteMissionResponseDtoSchema
>;
export type CompleteMissionSuccessResponseDto = Extract<
  CompleteMissionResponseDto,
  { success: true }
>;
export type CompleteMissionErrorResponseDto = Extract<
  CompleteMissionResponseDto,
  { success: false }
>;
