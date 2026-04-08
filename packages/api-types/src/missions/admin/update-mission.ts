/*
 PUT /admin/missions/:id
 Auth: ADMIN role
*/

import z from "zod";
import { responseDtoSchema } from "src/helpers";
import {
  MissionTitleSchema,
  MissionDescriptionSchema,
  MissionPointsSchema,
  MissionMinLevelSchema,
  MissionCategorySchema,
} from "src/common/mission";
import { MissionErrorCode } from "src/common/error-codes";

export const AdminUpdateMissionRequestDtoSchema = z.object({
  title: MissionTitleSchema,
  description: MissionDescriptionSchema,
  points: MissionPointsSchema,
  minLevel: MissionMinLevelSchema,
  category: MissionCategorySchema,
});

export type AdminUpdateMissionRequestDto = z.output<
  typeof AdminUpdateMissionRequestDtoSchema
>;

export const AdminUpdateMissionResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.enum([MissionErrorCode.MISSION_NOT_FOUND]),
);

export type AdminUpdateMissionResponseDto = z.output<
  typeof AdminUpdateMissionResponseDtoSchema
>;
export type AdminUpdateMissionSuccessResponseDto = Extract<
  AdminUpdateMissionResponseDto,
  { success: true }
>;
export type AdminUpdateMissionErrorResponseDto = Extract<
  AdminUpdateMissionResponseDto,
  { success: false }
>;
