/*
 POST /reports/comment
 Auth: USER role
*/

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { ReportReasonSchema } from "../common/report";
import { CommentErrorCode, ReportErrorCode } from "../common/error-codes";

export const CreateCommentReportRequestDtoSchema = z.object({
  commentId: z.int(),
  reason: ReportReasonSchema,
});

export type CreateCommentReportRequestDto = z.output<
  typeof CreateCommentReportRequestDtoSchema
>;

export const CreateCommentReportResponseDtoSchema = responseDtoSchema(
  z.object({ id: z.int() }),
  z.enum([
    CommentErrorCode.COMMENT_NOT_FOUND,
    ReportErrorCode.REPORT_REASON_EMPTY,
    ReportErrorCode.REPORT_NOT_FOUND,
  ]),
);

export type CreateCommentReportResponseDto = z.output<
  typeof CreateCommentReportResponseDtoSchema
>;
export type CreateCommentReportSuccessResponseDto = Extract<
  CreateCommentReportResponseDto,
  { success: true }
>;
export type CreateCommentReportErrorResponseDto = Extract<
  CreateCommentReportResponseDto,
  { success: false }
>;
