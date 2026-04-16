/*
 GET /counsels
 Auth: USER role
*/

import z from "zod";
import { responseDtoSchema } from "../helpers";
import {
  CounselCategorySchema,
  CounselSummaryDtoSchema,
} from "../common/counsel";
import {
  CursorPaginationQuerySchema,
  CursorPaginatedResultSchema,
} from "../common/pagination";
import { PaginationErrorCode } from "../common/error-codes";
import { booleanSerializerCodec } from "src/common/codecs";

export const ListCounselsQueryDtoSchema = CursorPaginationQuerySchema([
  "createdAt",
] as const).extend({
  category: CounselCategorySchema,
  responded: booleanSerializerCodec,
});

export type ListCounselsQueryDto = z.output<typeof ListCounselsQueryDtoSchema>;

export const ListCounselsResponseDtoSchema = responseDtoSchema(
  CursorPaginatedResultSchema(CounselSummaryDtoSchema),
  z.enum([PaginationErrorCode.INVALID_CURSOR]),
);

export type ListCounselsResponseDto = z.output<
  typeof ListCounselsResponseDtoSchema
>;
export type ListCounselsSuccessResponseDto = Extract<
  ListCounselsResponseDto,
  { success: true }
>;
export type ListCounselsErrorResponseDto = Extract<
  ListCounselsResponseDto,
  { success: false }
>;
