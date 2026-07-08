/*
 GET /admin/reports
 Auth: ADMIN role
*/

import z from "zod";
import { responseDtoSchema } from "../../helpers";
import { ReportReasonSchema, ReportDtoSchema } from "../../common/report";
import { numberSerializerCodec } from "../../common/codecs";

export const GetReportListRequestDtoSchema = z.object({
  page: numberSerializerCodec.pipe(z.int().min(1)).default(1),
  limit: numberSerializerCodec.pipe(z.int().min(1)).default(10),
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
  z.never(),
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
