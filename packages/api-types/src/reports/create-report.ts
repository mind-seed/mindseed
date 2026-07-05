/*
 POST /reports
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { ReportReasonSchema } from "../common/report";
import { PostErrorCode } from "../common/error-codes";

export const CreateReportRequestDtoSchema = z.object({
  postId: z.int(),
  reason: ReportReasonSchema,
});

export type CreateReportRequestDto = z.output<
  typeof CreateReportRequestDtoSchema
>;

export const CreateReportResponseDtoSchema = responseDtoSchema(
  z.object({
    id: z.int(),
  }),
  z.enum([PostErrorCode.POST_NOT_FOUND]),
);

export type CreateReportResponseDto = z.output<
  typeof CreateReportResponseDtoSchema
>;
export type CreateReportSuccessResponseDto = Extract<
  CreateReportResponseDto,
  { success: true }
>;
export type CreateReportErrorResponseDto = Extract<
  CreateReportResponseDto,
  { success: false }
>;