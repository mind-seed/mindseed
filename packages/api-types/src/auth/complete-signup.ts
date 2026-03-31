/*
 POST /auth/complete-signup
 Authorization: Bearer <signUpToken from /auth/verify-mail>
 */

import z from "zod";
import { ageSchema, nicknameSchema, passwordSchema } from "./common";
import { responseDtoSchema } from "../helpers";
import { AuthErrorCode } from "../common/error-codes";

export const CompleteSignupRequestDtoSchema = z.object({
  password: passwordSchema,
  nickname: nicknameSchema,
  age: ageSchema,
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
