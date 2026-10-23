/*
 GET /admin/resources
 Auth: ADMIN role
 */

import z from "zod";
import { responseDtoSchema } from "src/helpers";
import { ResourceCategorySchema, ResourceDtoSchema } from "src/common/resource";
import {
  OffsetPaginationQuerySchema,
  OffsetPaginatedResultSchema,
} from "src/common/pagination";

export const AdminListResourcesQueryDtoSchema = OffsetPaginationQuerySchema([
  "createdAt",
] as const).extend({
  category: ResourceCategorySchema.optional(),
});

export type AdminListResourcesQueryDto = z.output<
  typeof AdminListResourcesQueryDtoSchema
>;

export const AdminListResourcesResponseDtoSchema = responseDtoSchema(
  OffsetPaginatedResultSchema(ResourceDtoSchema),
  z.never(),
);

export type AdminListResourcesResponseDto = z.output<
  typeof AdminListResourcesResponseDtoSchema
>;
export type AdminListResourcesSuccessResponseDto = Extract<
  AdminListResourcesResponseDto,
  { success: true }
>;
export type AdminListResourcesErrorResponseDto = Extract<
  AdminListResourcesResponseDto,
  { success: false }
>;
