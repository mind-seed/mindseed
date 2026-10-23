/*
 GET /admin/comments
 Auth: ADMIN role
 */

import z from "zod";
import { responseDtoSchema } from "../../helpers";
import {
  booleanSerializerCodec,
  numberSerializerCodec,
} from "../../common/codecs";
import { AdminCommentDtoSchema } from "src/common/comment";

export const AdminListCommentsOrderByFieldsSchema = z.enum([
  "latest",
  "oldest",
  "mostReported",
]);

export const AdminListCommentsQueryDtoSchema = z.object({
  page: numberSerializerCodec.pipe(z.int().min(1)).default(1),
  limit: numberSerializerCodec.pipe(z.int().min(1).max(100)).default(10),
  orderBy: AdminListCommentsOrderByFieldsSchema.default("latest"),
  isReported: booleanSerializerCodec.default(false),
  query: z.string().max(200).optional(),
});

export type AdminListCommentsQueryDto = z.output<
  typeof AdminListCommentsQueryDtoSchema
>;

export const AdminListCommentsResponseDtoSchema = responseDtoSchema(
  z.object({
    comments: z.array(AdminCommentDtoSchema),
    totalCount: z.int().min(0),
  }),
  z.never(),
);

export type AdminListCommentsResponseDto = z.output<
  typeof AdminListCommentsResponseDtoSchema
>;
export type AdminListCommentsSuccessResponseDto = Extract<
  AdminListCommentsResponseDto,
  { success: true }
>;
export type AdminListCommentsErrorResponseDto = Extract<
  AdminListCommentsResponseDto,
  { success: false }
>;
