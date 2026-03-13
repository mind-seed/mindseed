import {
  Controller,
  Post,
  Headers,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  SendMailRequestDtoSchema,
  VerifyMailRequestDtoSchema,
  CompleteSignupRequestDtoSchema,
} from "@mindseed/api-types";
import type {
  SendMailRequestDto,
  SendMailSuccessResponseDto,
  VerifyMailRequestDto,
  VerifyMailSuccessResponseDto,
  CompleteSignupRequestDto,
  CompleteSignupSuccessResponseDto,
} from "@mindseed/api-types";
import { AuthService } from "./auth.service";
import { ZodBody } from "src/common/pipes/zod-body.decorator";

@Controller("/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/send-mail")
  @HttpCode(HttpStatus.OK)
  async sendMail(
    @ZodBody(SendMailRequestDtoSchema) body: SendMailRequestDto,
  ): Promise<SendMailSuccessResponseDto> {
    await this.authService.sendVerificationMail(body.email);
    return { success: true, data: null };
  }

  @Post("/verify-mail")
  @HttpCode(HttpStatus.OK)
  async verifyMail(
    @ZodBody(VerifyMailRequestDtoSchema) body: VerifyMailRequestDto,
  ): Promise<VerifyMailSuccessResponseDto> {
    const signUpToken = await this.authService.verifyMail(
      body.email,
      body.code,
    );
    return { success: true, data: { signUpToken } };
  }

  @Post("/complete-signup")
  @HttpCode(HttpStatus.CREATED)
  async completeSignup(
    @Headers("authorization") authorization: string,
    @ZodBody(CompleteSignupRequestDtoSchema) body: CompleteSignupRequestDto,
  ): Promise<CompleteSignupSuccessResponseDto> {
    const signUpToken = authorization?.replace(/^Bearer\s+/i, "");
    const result = await this.authService.completeSignup(
      signUpToken,
      body.password,
      body.nickname,
      body.age,
    );
    return { success: true, data: result };
  }
}
