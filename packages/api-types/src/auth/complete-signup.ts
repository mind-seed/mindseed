/*
 POST /auth/complete-signup
 Authorization: Bearer <signUpToken from /auth/verify-mail>
 */

import z from "zod";
import { AgeSchema, NicknameSchema, PasswordSchema } from "../common/user";
import { responseDtoSchema } from "../helpers";
import { AuthErrorCode } from "../common/error-codes";

export const CompleteSignupRequestDtoSchema = z.object({
  password: PasswordSchema,
  nickname: NicknameSchema,
  age: AgeSchema,
});

export type CompleteSignupRequestDto = z.output<
  typeof CompleteSignupRequestDtoSchema
>;

export const CompleteSignupResponseDtoSchema = responseDtoSchema(
  z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
  z.enum([
    AuthErrorCode.EMAIL_ALREADY_EXISTS,
    AuthErrorCode.INVALID_SIGN_UP_TOKEN,
  ]),
);

export type CompleteSignupResponseDto = z.output<
  typeof CompleteSignupResponseDtoSchema
>;
export type CompleteSignupSuccessResponseDto = Extract<
  CompleteSignupResponseDto,
  { success: true }
>;
export type CompleteSignupErrorResponseDto = Extract<
  CompleteSignupResponseDto,
  { success: false }
>;
