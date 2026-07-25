/*
 GET /admin/posts/:id
 Auth: ADMIN role
 */

import z from "zod";
import { responseDtoSchema } from "../../helpers";
import { AdminPostWithCommentsSchema } from "../../common/post";
import { PostErrorCode } from "../../common/error-codes";

export const AdminGetPostResponseDtoSchema = responseDtoSchema(
  AdminPostWithCommentsSchema,
  z.enum([PostErrorCode.POST_NOT_FOUND]),
);

export type AdminGetPostResponseDto = z.output<
  typeof AdminGetPostResponseDtoSchema
>;
export type AdminGetPostSuccessResponseDto = Extract<
  AdminGetPostResponseDto,
  { success: true }
>;
export type AdminGetPostErrorResponseDto = Extract<
  AdminGetPostResponseDto,
  { success: false }
>;
