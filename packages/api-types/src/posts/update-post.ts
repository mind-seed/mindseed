/*
 PUT /posts/:id
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import {
  PostCategorySchema,
  PostNotFoundErrorCode,
  NotPostAuthorErrorCode,
  PostContentSchema,
  PostAttachmentsSchema,
} from "./common";

export const UpdatePostRequestDtoSchema = z.object({
  content: PostContentSchema,
  category: PostCategorySchema,
  attachmentIds: PostAttachmentsSchema,
});

export type UpdatePostRequestDto = z.output<typeof UpdatePostRequestDtoSchema>;

export const UpdatePostResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.enum([
    PostNotFoundErrorCode,
    NotPostAuthorErrorCode,
    "ATTACHMENT_NOT_FOUND",
    "ATTACHMENT_ALREADY_ASSOCIATED",
  ]),
);

export type UpdatePostResponseDto = z.output<
  typeof UpdatePostResponseDtoSchema
>;
export type UpdatePostSuccessResponseDto = Extract<
  UpdatePostResponseDto,
  { success: true }
>;
export type UpdatePostErrorResponseDto = Extract<
  UpdatePostResponseDto,
  { success: false }
>;
