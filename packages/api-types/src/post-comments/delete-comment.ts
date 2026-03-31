/*
 DELETE /posts/:postId/comments/:commentId
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { PostErrorCode, CommentErrorCode } from "../common/error-codes";

export const DeleteCommentResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.enum([
    PostErrorCode.POST_NOT_FOUND,
    CommentErrorCode.COMMENT_NOT_FOUND,
    CommentErrorCode.NOT_COMMENT_AUTHOR,
  ]),
);

export type DeleteCommentResponseDto = z.output<
  typeof DeleteCommentResponseDtoSchema
>;
export type DeleteCommentSuccessResponseDto = Extract<
  DeleteCommentResponseDto,
  { success: true }
>;
export type DeleteCommentErrorResponseDto = Extract<
  DeleteCommentResponseDto,
  { success: false }
>;
