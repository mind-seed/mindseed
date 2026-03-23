/*
 GET /posts
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { PostCategorySchema, PostDtoSchema } from "./common";

export const ListPostsQueryDtoSchema = z.object({
  cursor: z.int().optional(),
  limit: z.int().default(10),
  category: PostCategorySchema.optional(),
  orderBy: z.enum(["createdAt"]).default("createdAt"),
});

export type ListPostsQueryDto = z.output<typeof ListPostsQueryDtoSchema>;

export const ListPostsResponseDtoSchema = responseDtoSchema(
  z.object({
    posts: z.array(PostDtoSchema),
    nextCursor: z.int().nullable(),
  }),
  z.enum([])
);

export type ListPostsResponseDto = z.output<typeof ListPostsResponseDtoSchema>;
export type ListPostsSuccessResponseDto = Extract<ListPostsResponseDto, { success: true }>;
export type ListPostsErrorResponseDto = Extract<ListPostsResponseDto, { success: false }>;
