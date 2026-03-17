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
  LoginRequestDtoSchema,
} from "@mindseed/api-types";
import type {
  SendMailRequestDto,
  SendMailSuccessResponseDto,
  VerifyMailRequestDto,
  VerifyMailSuccessResponseDto,
  CompleteSignupRequestDto,
  CompleteSignupSuccessResponseDto,
  LoginRequestDto,
  LoginSuccessResponseDto,
  RefreshTokensSuccessResponseDto,
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

  @Post("/login")
  @HttpCode(HttpStatus.OK)
  async login(
    @ZodBody(LoginRequestDtoSchema) body: LoginRequestDto,
  ): Promise<LoginSuccessResponseDto> {
    const { user, tokens } = await this.authService.login(
      body.email,
      body.password,
    );
    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
          profile: { nickname: user.profile.nickname, age: user.profile.age },
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  @Post("/refresh-tokens")
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Headers("authorization") authorization: string,
  ): Promise<RefreshTokensSuccessResponseDto> {
    const refreshToken = authorization?.replace(/^Bearer\s+/i, "");
    const tokens = await this.authService.refreshTokens(refreshToken);
    return { success: true, data: tokens };
  }
}
