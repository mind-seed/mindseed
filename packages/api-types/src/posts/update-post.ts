/*
 PUT /posts/:id
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import {
  PostCategorySchema,
  PostContentSchema,
  PostAttachmentIdsSchema,
} from "../common/post";
import { PostErrorCode, AttachmentErrorCode } from "../common/error-codes";

export const UpdatePostRequestDtoSchema = z.object({
  content: PostContentSchema,
  category: PostCategorySchema,
  attachmentIds: PostAttachmentIdsSchema,
});

export type UpdatePostRequestDto = z.output<typeof UpdatePostRequestDtoSchema>;

export const UpdatePostResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.enum([
    PostErrorCode.POST_NOT_FOUND,
    PostErrorCode.NOT_POST_AUTHOR,
    AttachmentErrorCode.ATTACHMENT_NOT_FOUND,
    AttachmentErrorCode.ATTACHMENT_ALREADY_ASSOCIATED,
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
