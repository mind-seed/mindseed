/*
 POST /auth/verify-mail
 */

import z from "zod";
import { verificationCodeSchema } from "./common";
import { responseDtoSchema } from "../shared";

export const VerifyMailRequestDtoSchema = z.object({
  email: z.email(),
  code: verificationCodeSchema,
});

export type VerifyMailRequestDto = z.output<typeof VerifyMailRequestDtoSchema>;

export const VerifyMailResponseDtoSchema = responseDtoSchema(
  z.object({
    signUpToken: z.string(),
  }),
  z.enum(["INVALID_VERIFICATION_CODE"])
);

export type VerifyMailResponseDto = z.output<typeof VerifyMailResponseDtoSchema>;
export type VerifyMailSuccessResponseDto = Extract<VerifyMailResponseDto, { success: true }>;
export type VerifyMailErrorResponseDto = Extract<VerifyMailResponseDto, { success: false }>;
