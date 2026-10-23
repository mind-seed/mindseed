import { Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { CurrentUser, UserOnly } from "src/auth/decorators/auth.decorators";
import { User } from "src/user/entities/user.entity";
import { ReportService } from "src/report/report.service";
import type { CreateCommentReportRequestDto } from "@mindseed/api-types";
import {
  CreateCommentReportRequestDtoSchema,
  CreateCommentReportResponseDtoSchema,
  CreateCommentReportSuccessResponseDto,
} from "@mindseed/api-types";
import { ZodEncodeResponse } from "src/common/interceptors/zod-encode-response.decorator";
import { ZodBody } from "src/common/pipes/zod-validation.decorator";

@Controller("/reports/comment")
export class ReportCommentController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UserOnly()
  @ZodEncodeResponse(CreateCommentReportResponseDtoSchema)
  async createReport(
    @CurrentUser() user: User,
    @ZodBody(CreateCommentReportRequestDtoSchema)
    body: CreateCommentReportRequestDto,
  ): Promise<CreateCommentReportSuccessResponseDto> {
    const report = await this.reportService.createCommentReport(
      user.id,
      body.commentId,
      body.reason,
    );
    return {
      success: true,
      data: {
        id: report.id,
      },
    };
  }
}
