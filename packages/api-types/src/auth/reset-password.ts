/*
 POST /auth/reset-password
 Authorization: Bearer <token from /auth/email/token>
 */

import z from "zod";
import { PasswordSchema } from "../common/user";
import { responseDtoSchema } from "../helpers";
import { AuthErrorCode } from "../common/error-codes";

export const ResetPasswordRequestDtoSchema = z.object({
  password: PasswordSchema,
});

export type ResetPasswordRequestDto = z.output<
  typeof ResetPasswordRequestDtoSchema
>;

export const ResetPasswordResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.enum([AuthErrorCode.INVALID_PASSWORD_RESET_TOKEN]),
);

export type ResetPasswordResponseDto = z.output<
  typeof ResetPasswordResponseDtoSchema
>;

export type ResetPasswordSuccessResponseDto = Extract<
  ResetPasswordResponseDto,
  { success: true }
>;

export type ResetPasswordErrorResponseDto = Extract<
  ResetPasswordResponseDto,
  { success: false }
>;
