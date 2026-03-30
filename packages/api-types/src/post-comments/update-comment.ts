/*
 PATCH /posts/:postId/comments/:commentId
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { PostNotFoundErrorCode } from "../posts/common";
import {
  CommentContentSchema,
  CommentNotFoundErrorCode,
  NotCommentAuthorErrorCode,
} from "./common";

export const UpdateCommentRequestDtoSchema = z.object({
  content: CommentContentSchema,
});

export type UpdateCommentRequestDto = z.output<
  typeof UpdateCommentRequestDtoSchema
>;

export const UpdateCommentResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.enum([
    PostNotFoundErrorCode,
    CommentNotFoundErrorCode,
    NotCommentAuthorErrorCode,
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
