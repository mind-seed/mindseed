/*
 POST /auth/send-mail
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { AuthErrorCode } from "../common/error-codes";

export const SendMailRequestDtoSchema = z.object({
  email: z.email(),
});

export type SendMailRequestDto = z.output<typeof SendMailRequestDtoSchema>;

export const SendMailResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.enum([
    AuthErrorCode.EMAIL_ALREADY_EXISTS,
    AuthErrorCode.EMAIL_RATE_LIMITED,
    AuthErrorCode.VERIFICATION_COOLDOWN,
  ]),
);

export type SendMailResponseDto = z.output<typeof SendMailResponseDtoSchema>;
export type SendMailSuccessResponseDto = Extract<
  SendMailResponseDto,
  { success: true }
>;
export type SendMailErrorResponseDto = Extract<
  SendMailResponseDto,
  { success: false }
>;
