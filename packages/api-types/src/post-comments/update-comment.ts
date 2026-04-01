/*
 PATCH /posts/:postId/comments/:commentId
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { CommentContentSchema } from "../common/comment";
import { PostErrorCode, CommentErrorCode } from "../common/error-codes";

export const UpdateCommentRequestDtoSchema = z.object({
  content: CommentContentSchema,
});

export type UpdateCommentRequestDto = z.output<
  typeof UpdateCommentRequestDtoSchema
>;

export const UpdateCommentResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.enum([
    PostErrorCode.POST_NOT_FOUND,
    CommentErrorCode.COMMENT_NOT_FOUND,
    CommentErrorCode.NOT_COMMENT_AUTHOR,
  ]),
);

export type UpdateCommentResponseDto = z.output<
  typeof UpdateCommentResponseDtoSchema
>;
export type UpdateCommentSuccessResponseDto = Extract<
  UpdateCommentResponseDto,
  { success: true }
>;
export type UpdateCommentErrorResponseDto = Extract<
  UpdateCommentResponseDto,
  { success: false }
>;
