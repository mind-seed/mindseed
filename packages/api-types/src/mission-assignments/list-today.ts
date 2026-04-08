/*
 GET /mission-assignments/today
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { MissionAssignmentDtoSchema } from "../common/mission";

export const ListTodayMissionAssignmentsResponseDtoSchema = responseDtoSchema(
  z.object({
    assignments: z.array(MissionAssignmentDtoSchema),
  }),
  z.never(),
);

export type ListTodayMissionAssignmentsResponseDto = z.output<
  typeof ListTodayMissionAssignmentsResponseDtoSchema
>;
export type ListTodayMissionAssignmentsSuccessResponseDto = Extract<
  ListTodayMissionAssignmentsResponseDto,
  { success: true }
>;
export type ListTodayMissionAssignmentsErrorResponseDto = Extract<
  ListTodayMissionAssignmentsResponseDto,
  { success: false }
>;
