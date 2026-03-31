/*
 POST /posts/:postId/comments
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import {
  PostAuthorNicknameSchema,
  PostNotFoundErrorCode,
} from "../posts/common";
import { CommentContentSchema } from "./common";

export const CreateCommentRequestDtoSchema = z.object({
  nickname: PostAuthorNicknameSchema,
  content: CommentContentSchema,
});

export type CreateCommentRequestDto = z.output<
  typeof CreateCommentRequestDtoSchema
>;

export const CreateCommentResponseDtoSchema = responseDtoSchema(
  z.object({
    id: z.int(),
  }),
  z.enum([PostNotFoundErrorCode]),
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
