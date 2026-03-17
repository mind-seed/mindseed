/*
 POST /auth/complete-signup
 Authorization: Bearer <signUpToken from /auth/verify-mail>
 */

import z from "zod";
import {
  ageSchema,
  nicknameSchema,
  passwordSchema,
  type EmailAlreadyExistsErrorCode,
} from "./common";
import type { ErrorResponseDto, SuccessResponseDto } from "../shared";

export const CompleteSignupRequestDtoSchema = z.object({
  password: passwordSchema,
  nickname: nicknameSchema,
  age: ageSchema,
});

export type CompleteSignupRequestDto = z.infer<
  typeof CompleteSignupRequestDtoSchema
>;

export type CompleteSignupSuccessResponseDto = SuccessResponseDto<{
  accessToken: string;
  refreshToken: string;
}>;

export type CompleteSignupErrorCode =
  | EmailAlreadyExistsErrorCode
  | "INVALID_SIGN_UP_TOKEN";

export type CompleteSignupErrorResponseDto =
  ErrorResponseDto<CompleteSignupErrorCode>;

export type CompleteSignupResponseDto =
  | CompleteSignupSuccessResponseDto
  | CompleteSignupErrorResponseDto;
