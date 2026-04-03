/*
 GET /resources
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { ResourceCategorySchema, ResourceDtoSchema } from "../common/resource";
import {
  CursorPaginationQuerySchema,
  CursorPaginatedResultSchema,
} from "../common/pagination";
import { PaginationErrorCode } from "../common/error-codes";

export const ListResourcesQueryDtoSchema = CursorPaginationQuerySchema([
  "createdAt",
] as const).extend({
  category: ResourceCategorySchema.optional(),
});

export type ListResourcesQueryDto = z.output<
  typeof ListResourcesQueryDtoSchema
>;

export const ListResourcesResponseDtoSchema = responseDtoSchema(
  CursorPaginatedResultSchema(ResourceDtoSchema),
  z.enum([PaginationErrorCode.INVALID_CURSOR]),
);

export type ListResourcesResponseDto = z.output<
  typeof ListResourcesResponseDtoSchema
>;
export type ListResourcesSuccessResponseDto = Extract<
  ListResourcesResponseDto,
  { success: true }
>;
export type ListResourcesErrorResponseDto = Extract<
  ListResourcesResponseDto,
  { success: false }
>;
