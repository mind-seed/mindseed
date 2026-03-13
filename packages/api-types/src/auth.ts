import * as z from "zod";
import type { ErrorResponseDto, SuccessResponseDto } from "./shared";

/*
 common
 */

export const verificationCodeSchema = z.string().regex(/^[0-9]{6}$/);

// 알파벳 소문자, 알파벳 대문자, 숫자, 특수문자로만 이루어짐 및 각 1자 이상
export const passwordSchema = z
  .string()
  .min(8)
  .max(20)
  .regex(/[a-z]/)
  .regex(/[A-Z]/)
  .regex(/[0-9]/)
  .regex(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/)
  .regex(/^[a-zA-Z0-9!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]+$/);

export const nicknameSchema = z
  .string()
  .min(2)
  .max(8)
  .regex(/^[가-힣A-z0-9\s]+$/);

export const ageSchema = z.int().min(0);

// shared error codes

export type EmailAlreadyExistsErrorCode = "EMAIL_ALREADY_EXISTS";

/*
 POST /auth/send-mail
 */

export const SendMailRequestDtoSchema = z.object({
  email: z.email(),
});

export type SendMailRequestDto = z.infer<typeof SendMailRequestDtoSchema>;

export type SendMailSuccessResponseDto = SuccessResponseDto<null>;

export type SendMailErrorCode =
  | EmailAlreadyExistsErrorCode
  | "EMAIL_RATE_LIMITED"
  | "VERIFICATION_COOLDOWN";

export type SendMailErrorResponseDto = ErrorResponseDto<SendMailErrorCode>;

export type SendMailResponseDto = SendMailSuccessResponseDto | SendMailErrorResponseDto;

/*
 POST /auth/verify-mail
 */

export const VerifyMailRequestDtoSchema = z.object({
  email: z.email(),
  code: verificationCodeSchema,
});

export type VerifyMailRequestDto = z.infer<typeof VerifyMailRequestDtoSchema>;

export type VerifyMailSuccessResponseDto = SuccessResponseDto<{
  signUpToken: string;
}>;

export type VerifyMailErrorCode = "INVALID_VERIFICATION_CODE";

export type VerifyMailErrorResponseDto = ErrorResponseDto<VerifyMailErrorCode>;

export type VerifyMailResponseDto = VerifyMailSuccessResponseDto | VerifyMailErrorResponseDto;

/*
 POST /auth/complete-signup
 Authorization: Bearer <signUpToken from /auth/verify-mail>
 */

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
