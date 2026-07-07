/*
 POST /admin/reports
 Auth: ADMIN role
*/

import z from "zod";
import { responseDtoSchema } from "../../helpers";
import { ReportReasonSchema, ReportDtoSchema } from "../../common/report";
import { CommentErrorCode } from "../../common/error-codes";

export const GetReportListRequestDtoSchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),
  orderDirection: z.enum(["ASC", "DESC"]).optional().default("DESC"),
});

export type GetReportListRequestDto = z.output<
  typeof GetReportListRequestDtoSchema
>;

export const GetReportListResponseDtoSchema = responseDtoSchema(
  z.object({
    reports: z.array(ReportDtoSchema),
    totalCount: z.number(),
  }),
  z.enum([]),
);

export type GetReportListResponseDto = z.output<
  typeof GetReportListResponseDtoSchema
>;
export type GetReportListSuccessResponseDto = Extract<
  GetReportListResponseDto,
  { success: true }
>;
export type GetReportListErrorResponseDto = Extract<
  GetReportListResponseDto,
  { success: false }
>;
