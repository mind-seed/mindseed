import { Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { CurrentUser, UserOnly } from "src/auth/decorators/auth.decorators";
import { User } from "src/user/entities/user.entity";
import { ReportService } from "src/report/report.service";
import type { CreateReportRequestDto } from "@mindseed/api-types";
import {
  CreateReportRequestDtoSchema,
  CreateReportResponseDtoSchema,
  CreateReportSuccessResponseDto,
} from "@mindseed/api-types";
import { ZodEncodeResponse } from "src/common/interceptors/zod-encode-response.decorator";
import { ZodBody } from "src/common/pipes/zod-validation.decorator";

@Controller("/reports")
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UserOnly()
  @ZodEncodeResponse(CreateReportResponseDtoSchema)
  async createReport(
    @CurrentUser() user: User,
    @ZodBody(CreateReportRequestDtoSchema) body: CreateReportRequestDto,
  ): Promise<CreateReportSuccessResponseDto> {
    const report = await this.reportService.createReport(
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
