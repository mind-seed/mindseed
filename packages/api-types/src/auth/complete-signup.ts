/*
 POST /auth/complete-signup
 Authorization: Bearer <signUpToken from /auth/verify-mail>
 */

import z from "zod";
import { ageSchema, EmailAlreadyExistsErrorCode, nicknameSchema, passwordSchema } from "./common";
import { responseDtoSchema } from "../helpers";

export const CompleteSignupRequestDtoSchema = z.object({
  password: passwordSchema,
  nickname: nicknameSchema,
  age: ageSchema,
});

export type CompleteSignupRequestDto = z.output<typeof CompleteSignupRequestDtoSchema>;

export const CompleteSignupResponseDtoSchema = responseDtoSchema(
  z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
  z.enum([EmailAlreadyExistsErrorCode, "INVALID_SIGN_UP_TOKEN"])
);

export type CompleteSignupResponseDto = z.output<typeof CompleteSignupResponseDtoSchema>;
export type CompleteSignupSuccessResponseDto = Extract<CompleteSignupResponseDto, { success: true }>;
export type CompleteSignupErrorResponseDto = Extract<CompleteSignupResponseDto, { success: false }>;
