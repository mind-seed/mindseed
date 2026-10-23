/*
 POST /auth/login
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { AuthErrorCode } from "../common/error-codes";

export const LoginRequestDtoSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export type LoginRequestDto = z.output<typeof LoginRequestDtoSchema>;

export const LoginResponseDtoSchema = responseDtoSchema(
  z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
  z.enum([AuthErrorCode.INVALID_CREDENTIALS]),
);

export type LoginResponseDto = z.output<typeof LoginResponseDtoSchema>;
export type LoginSuccessResponseDto = Extract<
  LoginResponseDto,
  { success: true }
>;
export type LoginErrorResponseDto = Extract<
  LoginResponseDto,
  { success: false }
>;
