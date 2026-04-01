/*
 POST /posts/:postId/comments
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { AuthorNicknameSchema } from "../common/author";
import { CommentContentSchema } from "../common/comment";
import { PostErrorCode } from "../common/error-codes";

export const CreateCommentRequestDtoSchema = z.object({
  nickname: AuthorNicknameSchema,
  content: CommentContentSchema,
});

export type CreateCommentRequestDto = z.output<
  typeof CreateCommentRequestDtoSchema
>;

export const CreateCommentResponseDtoSchema = responseDtoSchema(
  z.object({
    id: z.int(),
  }),
  z.enum([PostErrorCode.POST_NOT_FOUND]),
);

export type CreateCommentResponseDto = z.output<
  typeof CreateCommentResponseDtoSchema
>;
export type CreateCommentSuccessResponseDto = Extract<
  CreateCommentResponseDto,
  { success: true }
>;
export type CreateCommentErrorResponseDto = Extract<
  CreateCommentResponseDto,
  { success: false }
>;
