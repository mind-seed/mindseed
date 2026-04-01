/*
 POST /posts
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import {
  PostAttachmentIdsSchema,
  PostCategorySchema,
  PostContentSchema,
} from "../common/post";
import { AuthorNicknameSchema } from "../common/author";
import { AttachmentErrorCode } from "../common/error-codes";

export const CreatePostRequestDtoSchema = z.object({
  content: PostContentSchema,
  category: PostCategorySchema,
  nickname: AuthorNicknameSchema,
  attachmentIds: PostAttachmentIdsSchema,
});

export type CreatePostRequestDto = z.output<typeof CreatePostRequestDtoSchema>;

export const CreatePostResponseDtoSchema = responseDtoSchema(
  z.object({
    id: z.int(),
  }),
  z.enum([
    AttachmentErrorCode.ATTACHMENT_NOT_FOUND,
    AttachmentErrorCode.ATTACHMENT_ALREADY_ASSOCIATED,
  ]),
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
