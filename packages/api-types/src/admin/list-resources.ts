/*
 GET /admin/resources
 Auth: ADMIN role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { ResourceCategorySchema, ResourceDtoSchema } from "../common/resource";
import {
  OffsetPaginationQuerySchema,
  OffsetPaginatedResultSchema,
} from "../common/pagination";

export const AdminListResourcesQueryDtoSchema = OffsetPaginationQuerySchema([
  "createdAt",
]).extend({
  category: ResourceCategorySchema.optional(),
});

export type AdminListResourcesQueryDto = z.output<
  typeof AdminListResourcesQueryDtoSchema
>;

export const AdminListResourcesResponseDtoSchema = responseDtoSchema(
  OffsetPaginatedResultSchema(ResourceDtoSchema),
  z.enum([]),
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
