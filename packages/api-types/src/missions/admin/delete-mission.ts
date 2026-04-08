/*
 DELETE /admin/missions/:id
 Auth: ADMIN role
*/

import z from "zod";
import { responseDtoSchema } from "src/helpers";
import { MissionErrorCode } from "src/common/error-codes";

export const AdminDeleteMissionResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.enum([MissionErrorCode.MISSION_NOT_FOUND]),
);

export type AdminDeleteMissionResponseDto = z.output<
  typeof AdminDeleteMissionResponseDtoSchema
>;
export type AdminDeleteMissionSuccessResponseDto = Extract<
  AdminDeleteMissionResponseDto,
  { success: true }
>;
export type AdminDeleteMissionErrorResponseDto = Extract<
  AdminDeleteMissionResponseDto,
  { success: false }
>;
