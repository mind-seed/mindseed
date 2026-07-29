/*
 DELETE /admin/comments/:postId/:commentId
 Auth: ADMIN role
 */

import z from "zod";
import { responseDtoSchema } from "../../helpers";
import { PostErrorCode, CommentErrorCode } from "../../common/error-codes";

export const AdminDeleteCommentResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.enum([PostErrorCode.POST_NOT_FOUND, CommentErrorCode.COMMENT_NOT_FOUND]),
);

export type AdminDeleteCommentResponseDto = z.output<
  typeof AdminDeleteCommentResponseDtoSchema
>;
export type AdminDeleteCommentSuccessResponseDto = Extract<
  AdminDeleteCommentResponseDto,
  { success: true }
>;
export type AdminDeleteCommentErrorResponseDto = Extract<
  AdminDeleteCommentResponseDto,
  { success: false }
>;
