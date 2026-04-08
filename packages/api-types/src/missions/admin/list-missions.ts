/*
 GET /admin/missions
 Auth: ADMIN role
*/

import z from "zod";
import { responseDtoSchema } from "src/helpers";
import { MissionDtoSchema } from "src/common/mission";
import {
  OffsetPaginationQuerySchema,
  OffsetPaginatedResultSchema,
} from "src/common/pagination";

export const AdminListMissionsQueryDtoSchema = OffsetPaginationQuerySchema([
  "minLevel",
] as const);

export type AdminListMissionsQueryDto = z.output<
  typeof AdminListMissionsQueryDtoSchema
>;

export const AdminListMissionsResponseDtoSchema = responseDtoSchema(
  OffsetPaginatedResultSchema(MissionDtoSchema),
  z.never(),
);

export type AdminListMissionsResponseDto = z.output<
  typeof AdminListMissionsResponseDtoSchema
>;
export type AdminListMissionsSuccessResponseDto = Extract<
  AdminListMissionsResponseDto,
  { success: true }
>;
export type AdminListMissionsErrorResponseDto = Extract<
  AdminListMissionsResponseDto,
  { success: false }
>;
