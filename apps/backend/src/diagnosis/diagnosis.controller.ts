import type {
  CreateDiagnosisRequestDto,
  CreateDiagnosisSuccessResponseDto,
} from "@mindseed/api-types";
import {
  CreateDiagnosisRequestDtoSchema,
  CreateDiagnosisResponseDtoSchema,
} from "@mindseed/api-types";
import { Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { CurrentUser, UserOnly } from "src/auth/decorators/auth.decorators";
import { ZodEncodeResponse } from "src/common/interceptors/zod-encode-response.decorator";
import { ZodBody } from "src/common/pipes/zod-validation.decorator";
import { User } from "src/user/entities/user.entity";
import { DiagnosisService } from "./diagnosis.service";

@Controller("/diagnoses")
export class DiagnosisController {
  constructor(private readonly diagnosisService: DiagnosisService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UserOnly()
  @ZodEncodeResponse(CreateDiagnosisResponseDtoSchema)
  async createDiagnosis(
    @CurrentUser() user: User,
    @ZodBody(CreateDiagnosisRequestDtoSchema)
    body: CreateDiagnosisRequestDto,
  ): Promise<CreateDiagnosisSuccessResponseDto> {
    await this.diagnosisService.createDiagnosisEntry({
      userId: user.id,
      depressionScore: body.depressionScore,
      anxietyScore: body.anxietyScore,
      stressScore: body.stressScore,
    });

    return { success: true, data: null };
  }
}
