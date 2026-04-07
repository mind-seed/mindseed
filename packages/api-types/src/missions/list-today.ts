/*
 GET /missions/today
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { MissionDtoSchema } from "../common/mission";

export const ListTodayMissionsResponseDtoSchema = responseDtoSchema(
  z.object({
    missions: z.array(MissionDtoSchema),
  }),
  z.never(),
);

export type ListTodayMissionsResponseDto = z.output<
  typeof ListTodayMissionsResponseDtoSchema
>;
export type ListTodayMissionsSuccessResponseDto = Extract<
  ListTodayMissionsResponseDto,
  { success: true }
>;
export type ListTodayMissionsErrorResponseDto = Extract<
  ListTodayMissionsResponseDto,
  { success: false }
>;
