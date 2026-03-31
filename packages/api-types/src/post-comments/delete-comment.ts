/*
 DELETE /posts/:postId/comments/:commentId
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { PostNotFoundErrorCode } from "../posts/common";
import { CommentNotFoundErrorCode, NotCommentAuthorErrorCode } from "./common";

export const DeleteCommentResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.enum([
    PostNotFoundErrorCode,
    CommentNotFoundErrorCode,
    NotCommentAuthorErrorCode,
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
