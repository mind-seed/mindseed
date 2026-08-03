import { Controller, Get, HttpCode, HttpStatus, Patch } from "@nestjs/common";
import { CurrentUser, AdminOnly } from "src/auth/decorators/auth.decorators";
import { User } from "src/user/entities/user.entity";
import { ReportService } from "src/report/report.service";
import type {
  GetReportListRequestDto,
  PatchReportRequestDto,
  PatchReportSuccessResponseDto,
} from "@mindseed/api-types";
import {
  GetReportListRequestDtoSchema,
  GetReportListResponseDtoSchema,
  GetReportListSuccessResponseDto,
  idParamSchema,
  PatchReportRequestDtoSchema,
  PatchReportResponseDtoSchema,
} from "@mindseed/api-types";
import { ZodEncodeResponse } from "src/common/interceptors/zod-encode-response.decorator";
import {
  ZodBody,
  ZodParam,
  ZodQuery,
} from "src/common/pipes/zod-validation.decorator";
import type { getReportResult } from "src/report/report.service";

@Controller("/admin/reports")
export class ReportAdminController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @AdminOnly()
  @ZodEncodeResponse(GetReportListResponseDtoSchema)
  async getReports(
    @CurrentUser() user: User,
    @ZodQuery(GetReportListRequestDtoSchema) query: GetReportListRequestDto,
  ): Promise<GetReportListSuccessResponseDto> {
    const result: getReportResult = await this.reportService.getReports(
      query.page,
      query.limit,
      query.orderDirection,
    );
    /**
    export const ReportDtoSchema = z.object({
      id: z.int(),
      reason: ReportReasonSchema,
      createdAt: dateSerializerCodec,
      postId: z.int().nullable(),
      commentId: z.int().nullable(),
      range: z.enum(["POST", "COMMENT"]),
      user: AuthorDtoSchema,
    });
     */

    const reports = result.report.map((report) => ({
      id: report.id,
      reason: report.reason,
      createdAt: report.createdAt,
      postId: report.postId ?? null,
      commentId: report.commentId ?? null,
      range: report.range,
      user: report.user?.profile
        ? {
            nickname: report.user.profile.nickname,
          }
        : null,
    }));

    return {
      success: true,
      data: {
        reports,
        totalCount: result.totalCount,
      },
    };
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @AdminOnly()
  @ZodEncodeResponse(PatchReportResponseDtoSchema)
  async patchReport(
    @CurrentUser() user: User,
    @ZodBody(PatchReportRequestDtoSchema) body: PatchReportRequestDto,
    @ZodParam("id", idParamSchema) reportId: number,
  ): Promise<PatchReportSuccessResponseDto> {
    await this.reportService.patchReport({
      id: reportId,
      type: body.type,
      user,
    });

    return {
      success: true,
      data: null,
    };
  }
}
