/*
 GET /admin/counsels
 Auth: ADMIN role
*/

import z from "zod";
import { responseDtoSchema } from "src/helpers";
import {
  CounselCategorySchema,
  CounselSummaryDtoSchema,
} from "src/common/counsel";
import {
  OffsetPaginationQuerySchema,
  OffsetPaginatedResultSchema,
} from "src/common/pagination";
import { booleanSerializerCodec } from "src/common/codecs";

export const AdminListCounselsQueryDtoSchema = OffsetPaginationQuerySchema([
  "createdAt",
] as const).extend({
  category: CounselCategorySchema.optional(),
  responded: booleanSerializerCodec.optional(),
});

export type AdminListCounselsQueryDto = z.output<
  typeof AdminListCounselsQueryDtoSchema
>;

export const AdminListCounselsResponseDtoSchema = responseDtoSchema(
  OffsetPaginatedResultSchema(CounselSummaryDtoSchema),
  z.never(),
);

export type AdminListCounselsResponseDto = z.output<
  typeof AdminListCounselsResponseDtoSchema
>;
export type AdminListCounselsSuccessResponseDto = Extract<
  AdminListCounselsResponseDto,
  { success: true }
>;
export type AdminListCounselsErrorResponseDto = Extract<
  AdminListCounselsResponseDto,
  { success: false }
>;
