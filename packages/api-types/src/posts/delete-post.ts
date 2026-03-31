/*
 DELETE /posts/:id
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { PostErrorCode } from "../common/error-codes";

export const DeletePostResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.enum([PostErrorCode.POST_NOT_FOUND, PostErrorCode.NOT_POST_AUTHOR]),
);

export type DeletePostResponseDto = z.output<
  typeof DeletePostResponseDtoSchema
>;
export type DeletePostSuccessResponseDto = Extract<
  DeletePostResponseDto,
  { success: true }
>;
export type DeletePostErrorResponseDto = Extract<
  DeletePostResponseDto,
  { success: false }
>;
