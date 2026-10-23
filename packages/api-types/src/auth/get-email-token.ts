/*
 POST /auth/email/token
 */

import z from "zod";
import { VerificationCodeSchema } from "../common/auth";
import { responseDtoSchema } from "../helpers";
import { AuthErrorCode } from "../common/error-codes";

export const VerifyMailRequestDtoSchema = z.object({
  email: z.email(),
  code: VerificationCodeSchema,
});

export type VerifyMailRequestDto = z.output<typeof VerifyMailRequestDtoSchema>;

export const VerifyMailResponseDtoSchema = responseDtoSchema(
  z.object({
    token: z.string(),
  }),
  z.enum([AuthErrorCode.INVALID_VERIFICATION_CODE]),
);

export type VerifyMailResponseDto = z.output<
  typeof VerifyMailResponseDtoSchema
>;
export type VerifyMailSuccessResponseDto = Extract<
  VerifyMailResponseDto,
  { success: true }
>;
export type VerifyMailErrorResponseDto = Extract<
  VerifyMailResponseDto,
  { success: false }
>;
