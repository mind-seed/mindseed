/*
 GET /posts/:id
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../../helpers";
import { PostWithCommentsSchema } from "../../common/post";
import { PostErrorCode } from "../../common/error-codes";

export const GetPostResponseDtoSchema = responseDtoSchema(
  PostWithCommentsSchema,
  z.enum([PostErrorCode.POST_NOT_FOUND]),
);

export type GetPostResponseDto = z.output<typeof GetPostResponseDtoSchema>;
export type GetPostSuccessResponseDto = Extract<
  GetPostResponseDto,
  { success: true }
>;
export type GetPostErrorResponseDto = Extract<
  GetPostResponseDto,
  { success: false }
>;
