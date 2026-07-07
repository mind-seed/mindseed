import { Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { CurrentUser, UserOnly } from "src/auth/decorators/auth.decorators";
import { User } from "src/user/entities/user.entity";
import { ReportService } from "src/report/report.service";
import type { CreatePostReportRequestDto } from "@mindseed/api-types";
import {
  CreatePostReportRequestDtoSchema,
  CreatePostReportResponseDtoSchema,
  CreatePostReportSuccessResponseDto,
} from "@mindseed/api-types";
import { ZodEncodeResponse } from "src/common/interceptors/zod-encode-response.decorator";
import { ZodBody } from "src/common/pipes/zod-validation.decorator";

@Controller("/reports")
export class ReportAdminController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UserOnly()
  @ZodEncodeResponse(CreatePostReportResponseDtoSchema)
  async createReport(
    @CurrentUser() user: User,
    @ZodBody(CreatePostReportRequestDtoSchema) body: CreatePostReportRequestDto,
  ): Promise<CreatePostReportSuccessResponseDto> {
    const report = await this.reportService.createPostReport(
      user.id,
      body.postId,
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
