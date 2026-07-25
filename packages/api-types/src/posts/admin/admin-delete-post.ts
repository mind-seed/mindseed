/*
 DELETE /admin/posts/:id
 Auth: ADMIN role
 */

import z from "zod";
import { responseDtoSchema } from "../../helpers";
import { PostErrorCode } from "../../common/error-codes";

export const AdminDeletePostResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.enum([PostErrorCode.POST_NOT_FOUND]),
);

export type AdminDeletePostResponseDto = z.output<
  typeof AdminDeletePostResponseDtoSchema
>;
export type AdminDeletePostSuccessResponseDto = Extract<
  AdminDeletePostResponseDto,
  { success: true }
>;
export type AdminDeletePostErrorResponseDto = Extract<
  AdminDeletePostResponseDto,
  { success: false }
>;
