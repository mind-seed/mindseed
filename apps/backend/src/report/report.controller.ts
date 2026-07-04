import { Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { CurrentUser, UserOnly } from "src/auth/decorators/auth.decorators";
import { User } from "src/user/entities/user.entity";
import { ReportService } from "src/report/report.service";

@Controller("/reports")
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UserOnly()
  async createReport(@CurrentUser() user: User) {
    await this.reportService.createReport(user.id, 1, "신고 사유 테스트");
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UserOnly()
  async listReports() {
    // TODO
  }
}
