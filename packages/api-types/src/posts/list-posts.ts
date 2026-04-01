/*
 GET /posts
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { PostCategorySchema, PostDtoSchema } from "../common/post";
import { numberSerializerCodec } from "src/common/codecs";
import { PostErrorCode } from "../common/error-codes";

export const ListPostsQueryDtoSchema = z.object({
  cursor: z.string().optional(),
  limit: numberSerializerCodec.pipe(z.int().min(1)).default(10),
  category: PostCategorySchema.optional(),
  orderBy: z.enum(["createdAt"]).default("createdAt"),
  orderDirection: z.enum(["asc", "desc"]).default("asc"),
});

export type ListPostsQueryDto = z.output<typeof ListPostsQueryDtoSchema>;

export const ListPostsResponseDtoSchema = responseDtoSchema(
  z.object({
    posts: z.array(PostDtoSchema),
    nextCursor: z.string().nullable(),
  }),
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
