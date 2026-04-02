/*
 GET /posts
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { PostCategorySchema, PostDtoSchema } from "../common/post";
import {
  CursorPaginationQuerySchema,
  CursorPaginatedResultSchema,
} from "../common/pagination";
import { PostErrorCode } from "../common/error-codes";

export const ListPostsQueryDtoSchema = CursorPaginationQuerySchema([
  "createdAt",
]).extend({
  category: PostCategorySchema.optional(),
});

export type ListPostsQueryDto = z.output<typeof ListPostsQueryDtoSchema>;

export const ListPostsResponseDtoSchema = responseDtoSchema(
  CursorPaginatedResultSchema(PostDtoSchema),
  z.enum([PostErrorCode.INVALID_CURSOR]),
);

export type ListPostsResponseDto = z.output<typeof ListPostsResponseDtoSchema>;
export type ListPostsSuccessResponseDto = Extract<
  ListPostsResponseDto,
  { success: true }
>;
export type ListPostsErrorResponseDto = Extract<
  ListPostsResponseDto,
  { success: false }
>;
