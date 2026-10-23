/*
 POST /admin/missions
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

export const AdminCreateMissionRequestDtoSchema = z.object({
  title: MissionTitleSchema,
  description: MissionDescriptionSchema,
  points: MissionPointsSchema,
  minLevel: MissionMinLevelSchema,
  category: MissionCategorySchema,
});

export type AdminCreateMissionRequestDto = z.output<
  typeof AdminCreateMissionRequestDtoSchema
>;

export const AdminCreateMissionResponseDtoSchema = responseDtoSchema(
  z.object({
    id: z.int(),
  }),
  z.never(),
);

export type AdminCreateMissionResponseDto = z.output<
  typeof AdminCreateMissionResponseDtoSchema
>;
export type AdminCreateMissionSuccessResponseDto = Extract<
  AdminCreateMissionResponseDto,
  { success: true }
>;
export type AdminCreateMissionErrorResponseDto = Extract<
  AdminCreateMissionResponseDto,
  { success: false }
>;
