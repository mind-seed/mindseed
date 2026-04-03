/*
 POST /admin/resources
 Auth: ADMIN role
 */

import z from "zod";
import { responseDtoSchema } from "src/helpers";
import {
  ResourceTypeSchema,
  ResourceCategorySchema,
  ResourceDtoSchema,
  ResourceTitleSchema,
} from "src/common/resource";

export const AdminCreateResourceRequestDtoSchema = z.object({
  title: ResourceTitleSchema,
  type: ResourceTypeSchema,
  category: ResourceCategorySchema,
  url: z.url(),
});

export type AdminCreateResourceRequestDto = z.output<
  typeof AdminCreateResourceRequestDtoSchema
>;

export const AdminCreateResourceResponseDtoSchema = responseDtoSchema(
  ResourceDtoSchema,
  z.never(),
);

export type AdminCreateResourceResponseDto = z.output<
  typeof AdminCreateResourceResponseDtoSchema
>;
export type AdminCreateResourceSuccessResponseDto = Extract<
  AdminCreateResourceResponseDto,
  { success: true }
>;
export type AdminCreateResourceErrorResponseDto = Extract<
  AdminCreateResourceResponseDto,
  { success: false }
>;
