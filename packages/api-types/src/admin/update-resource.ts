/*
 PUT /admin/resources/:id
 Auth: ADMIN role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import {
  ResourceTitleSchema,
  ResourceTypeSchema,
  ResourceCategorySchema,
} from "../common/resource";
import { ResourceErrorCode } from "../common/error-codes";

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
