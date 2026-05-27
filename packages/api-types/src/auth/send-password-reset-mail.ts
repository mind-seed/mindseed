/*
 POST /auth/email/password-reset
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { AuthErrorCode } from "../common/error-codes";

export const EmailPasswordResetRequestDtoSchema = z.object({
  email: z.email(),
});

export type EmailPasswordResetRequestDto = z.output<
  typeof EmailPasswordResetRequestDtoSchema
>;

export const EmailPasswordResetResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.enum([
    AuthErrorCode.EMAIL_NOT_EXISTS,
    AuthErrorCode.EMAIL_RATE_LIMITED,
    AuthErrorCode.VERIFICATION_COOLDOWN,
  ]),
);

export type EmailPasswordResetResponseDto = z.output<
  typeof EmailPasswordResetResponseDtoSchema
>;

export type EmailPasswordResetSuccessResponseDto = Extract<
  EmailPasswordResetResponseDto,
  { success: true }
>;

export type EmailPasswordResetErrorResponseDto = Extract<
  EmailPasswordResetResponseDto,
  { success: false }
>;
