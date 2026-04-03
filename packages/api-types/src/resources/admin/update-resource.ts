/*
 PUT /admin/resources/:id
 Auth: ADMIN role
 */

import z from "zod";
import { responseDtoSchema } from "src/helpers";
import {
  ResourceTitleSchema,
  ResourceTypeSchema,
  ResourceCategorySchema,
} from "src/common/resource";
import { ResourceErrorCode } from "src/common/error-codes";

export const AdminUpdateResourceRequestDtoSchema = z.object({
  title: ResourceTitleSchema,
  type: ResourceTypeSchema,
  category: ResourceCategorySchema,
  url: z.url(),
});

export type AdminUpdateResourceRequestDto = z.output<
  typeof AdminUpdateResourceRequestDtoSchema
>;

export const AdminUpdateResourceResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.enum([ResourceErrorCode.RESOURCE_NOT_FOUND]),
);

export type AdminUpdateResourceResponseDto = z.output<
  typeof AdminUpdateResourceResponseDtoSchema
>;
export type AdminUpdateResourceSuccessResponseDto = Extract<
  AdminUpdateResourceResponseDto,
  { success: true }
>;
export type AdminUpdateResourceErrorResponseDto = Extract<
  AdminUpdateResourceResponseDto,
  { success: false }
>;
