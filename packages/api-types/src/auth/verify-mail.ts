/*
 POST /auth/verify-mail
 */

import z from "zod";
import { verificationCodeSchema } from "./common";
import type { ErrorResponseDto, SuccessResponseDto } from "../shared";

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

