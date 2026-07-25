/*
 GET /admin/posts
 Auth: ADMIN role
 */

import z from "zod";
import { responseDtoSchema } from "../../helpers";
import { AdminPostDtoSchema, PostCategorySchema } from "../../common/post";
import {
  booleanSerializerCodec,
  numberSerializerCodec,
} from "../../common/codecs";

export const AdminListPostsOrderByFieldsSchema = z.enum([
  "latest",
  "oldest",
  "mostReported",
]);

export const AdminListPostsQueryDtoSchema = z.object({
  page: numberSerializerCodec.pipe(z.int().min(1)).default(1),
  limit: numberSerializerCodec.pipe(z.int().min(1).max(100)).default(10),
  orderBy: AdminListPostsOrderByFieldsSchema.default("latest"),
  category: PostCategorySchema.optional(),
  isReported: booleanSerializerCodec.default(false),
  query: z.string().max(200).optional(),
});

export type AdminListPostsQueryDto = z.output<
  typeof AdminListPostsQueryDtoSchema
>;

export const AdminListPostsResponseDtoSchema = responseDtoSchema(
  z.object({
    posts: z.array(AdminPostDtoSchema),
    totalCount: z.int().min(0),
  }),
  z.never(),
);

export type AdminListPostsResponseDto = z.output<
  typeof AdminListPostsResponseDtoSchema
>;
export type AdminListPostsSuccessResponseDto = Extract<
  AdminListPostsResponseDto,
  { success: true }
>;
export type AdminListPostsErrorResponseDto = Extract<
  AdminListPostsResponseDto,
  { success: false }
>;
