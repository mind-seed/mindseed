/*
 PUT /posts/:id/like
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { PostNotFoundErrorCode } from "./common";

export const SetPostLikeRequestDtoSchema = z.object({
  liked: z.boolean(),
});

export type SetPostLikeRequestDto = z.output<typeof SetPostLikeRequestDtoSchema>;

export const SetPostLikeResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.enum([PostNotFoundErrorCode])
);

export type SetPostLikeResponseDto = z.output<typeof SetPostLikeResponseDtoSchema>;
export type SetPostLikeSuccessResponseDto = Extract<SetPostLikeResponseDto, { success: true }>;
export type SetPostLikeErrorResponseDto = Extract<SetPostLikeResponseDto, { success: false }>;
