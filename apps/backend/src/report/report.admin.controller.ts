import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { CurrentUser, AdminOnly } from "src/auth/decorators/auth.decorators";
import { User } from "src/user/entities/user.entity";
import { ReportService } from "src/report/report.service";
import type { GetReportListRequestDto } from "@mindseed/api-types";
import {
  GetReportListRequestDtoSchema,
  GetReportListResponseDtoSchema,
  GetReportListSuccessResponseDto,
} from "@mindseed/api-types";
import { ZodEncodeResponse } from "src/common/interceptors/zod-encode-response.decorator";
import { ZodBody } from "src/common/pipes/zod-validation.decorator";
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
    @ZodBody(GetReportListRequestDtoSchema) body: GetReportListRequestDto,
  ): Promise<GetReportListSuccessResponseDto> {
    const result: getReportResult = await this.reportService.getReports(
      body.page,
      body.limit,
      body.orderDirection,
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
      postId: report.post?.id ?? null,
      commentId: report.comment?.id ?? null,
      range: report.range,
      user: {
        id: report.user.id,
        email: report.user.email,
        nickname:
          report.user.profile?.nickname ?? report.user.email.split("@")[0],
      },
    }));

    return {
      success: true,
      data: {
        reports,
        totalCount: result.totalCount,
      },
    };
  }
}
