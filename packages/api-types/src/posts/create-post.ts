/*
 POST /posts
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import {
  PostAttachmentsSchema,
  PostAuthorNicknameSchema,
  PostCategorySchema,
  PostContentSchema,
} from "./common";

export const CreatePostRequestDtoSchema = z.object({
  content: PostContentSchema,
  category: PostCategorySchema,
  nickname: PostAuthorNicknameSchema,
  attachmentIds: PostAttachmentsSchema,
});

export type CreatePostRequestDto = z.output<typeof CreatePostRequestDtoSchema>;

export const CreatePostResponseDtoSchema = responseDtoSchema(
  z.object({
    id: z.int(),
  }),
  z.enum(["ATTACHMENT_NOT_FOUND", "ATTACHMENT_ALREADY_ASSOCIATED"]),
);

export type CreatePostResponseDto = z.output<
  typeof CreatePostResponseDtoSchema
>;
export type CreatePostSuccessResponseDto = Extract<
  CreatePostResponseDto,
  { success: true }
>;
export type CreatePostErrorResponseDto = Extract<
  CreatePostResponseDto,
  { success: false }
>;
