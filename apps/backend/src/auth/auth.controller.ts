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
  LogoutResponseDtoSchema,
  SendMailResponseDtoSchema,
  VerifyMailResponseDtoSchema,
  CompleteSignupResponseDtoSchema,
  LoginResponseDtoSchema,
  RefreshTokensResponseDtoSchema,
  EmailPasswordResetRequestDtoSchema,
  EmailPasswordResetResponseDtoSchema,
  ResetPasswordRequestDtoSchema,
  ResetPasswordResponseDtoSchema,
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
  LogoutSuccessResponseDto,
  RefreshTokensSuccessResponseDto,
  EmailPasswordResetRequestDto,
  EmailPasswordResetSuccessResponseDto,
  ResetPasswordRequestDto,
  ResetPasswordSuccessResponseDto,
} from "@mindseed/api-types";
import { AuthService } from "./auth.service";
import { ZodBody } from "src/common/pipes/zod-validation.decorator";
import { ZodEncodeResponse } from "src/common/interceptors/zod-encode-response.decorator";
import {
  Authenticated,
  CurrentUser,
  UnAuthenticated,
  UserOnly,
} from "./decorators/auth.decorators";
import { User } from "src/user/entities/user.entity";

@Controller("/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/email/sign-up")
  @HttpCode(HttpStatus.OK)
  @UnAuthenticated()
  @ZodEncodeResponse(SendMailResponseDtoSchema)
  async sendSignUpMail(
    @ZodBody(SendMailRequestDtoSchema) body: SendMailRequestDto,
  ): Promise<SendMailSuccessResponseDto> {
    await this.authService.sendSignUpVerificationMail(body.email);
    return { success: true, data: null };
  }

  @Post("/email/password-reset")
  @HttpCode(HttpStatus.OK)
  @UnAuthenticated()
  @ZodEncodeResponse(EmailPasswordResetResponseDtoSchema)
  async sendPasswordResetMail(
    @ZodBody(EmailPasswordResetRequestDtoSchema)
    body: EmailPasswordResetRequestDto,
  ): Promise<EmailPasswordResetSuccessResponseDto> {
    await this.authService.sendPasswordResetVerificationMail(body.email);
    return { success: true, data: null };
  }

  @Post("/email/token")
  @HttpCode(HttpStatus.OK)
  @UnAuthenticated()
  @ZodEncodeResponse(VerifyMailResponseDtoSchema)
  async getEmailToken(
    @ZodBody(VerifyMailRequestDtoSchema) body: VerifyMailRequestDto,
  ): Promise<VerifyMailSuccessResponseDto> {
    const token = await this.authService.verifyMail(body.email, body.code);
    return { success: true, data: { token } };
  }

  @Post("/sign-up")
  @HttpCode(HttpStatus.CREATED)
  @UnAuthenticated()
  @ZodEncodeResponse(CompleteSignupResponseDtoSchema)
  async signUp(
    @Headers("authorization") authorization: string,
    @ZodBody(CompleteSignupRequestDtoSchema) body: CompleteSignupRequestDto,
  ): Promise<CompleteSignupSuccessResponseDto> {
    const signUpToken = authorization?.replace(/^Bearer\s+/i, "");
    const result = await this.authService.signUp(
      signUpToken,
      body.password,
      body.nickname,
      body.age,
    );
    return { success: true, data: result };
  }

  @Post("/reset-password")
  @HttpCode(HttpStatus.OK)
  @UnAuthenticated()
  @ZodEncodeResponse(ResetPasswordResponseDtoSchema)
  async resetPassword(
    @Headers("authorization") authorization: string,
    @ZodBody(ResetPasswordRequestDtoSchema) body: ResetPasswordRequestDto,
  ): Promise<ResetPasswordSuccessResponseDto> {
    const token = authorization?.replace(/^Bearer\s+/i, "");
    await this.authService.resetPassword(token, body.password);
    return { success: true, data: null };
  }

  @Post("/login")
  @HttpCode(HttpStatus.OK)
  @UnAuthenticated()
  @ZodEncodeResponse(LoginResponseDtoSchema)
  async login(
    @ZodBody(LoginRequestDtoSchema) body: LoginRequestDto,
  ): Promise<LoginSuccessResponseDto> {
    const tokens = await this.authService.login(body.email, body.password);
    return {
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  @Post("/refresh-tokens")
  @HttpCode(HttpStatus.OK)
  @ZodEncodeResponse(RefreshTokensResponseDtoSchema)
  async refreshTokens(
    @Headers("authorization") authorization: string,
  ): Promise<RefreshTokensSuccessResponseDto> {
    const refreshToken = authorization?.replace(/^Bearer\s+/i, "");
    const tokens = await this.authService.refreshTokens(refreshToken);
    return { success: true, data: tokens };
  }

  @Post("/logout")
  @HttpCode(HttpStatus.OK)
  @Authenticated()
  @ZodEncodeResponse(LogoutResponseDtoSchema)
  async logout(@CurrentUser() user: User): Promise<LogoutSuccessResponseDto> {
    await this.authService.logout(user.id);
    return { success: true, data: null };
  }
}
