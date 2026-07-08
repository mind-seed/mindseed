/*
 POST /reports/post
 Auth: USER role
*/

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { ReportReasonSchema } from "../common/report";
import { PostErrorCode, ReportErrorCode } from "../common/error-codes";

export const CreatePostReportRequestDtoSchema = z.object({
  postId: z.int(),
  reason: ReportReasonSchema,
});

export type CreatePostReportRequestDto = z.output<
  typeof CreatePostReportRequestDtoSchema
>;

export const CreatePostReportResponseDtoSchema = responseDtoSchema(
  z.object({ id: z.int() }),
  z.enum([
    PostErrorCode.POST_NOT_FOUND,
    ReportErrorCode.REPORT_REASON_EMPTY,
  ]),
);

export type CreatePostReportResponseDto = z.output<
  typeof CreatePostReportResponseDtoSchema
>;
export type CreatePostReportSuccessResponseDto = Extract<
  CreatePostReportResponseDto,
  { success: true }
>;
export type CreatePostReportErrorResponseDto = Extract<
  CreatePostReportResponseDto,
  { success: false }
>;
