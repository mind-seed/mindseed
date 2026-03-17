/*
 POST /auth/send-mail
 */

import z from "zod";
import { responseDtoSchema } from "../shared";

export const SendMailRequestDtoSchema = z.object({
  email: z.email(),
});

export type SendMailRequestDto = z.output<typeof SendMailRequestDtoSchema>;

export const SendMailResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.enum(["EMAIL_ALREADY_EXISTS", "EMAIL_RATE_LIMITED", "VERIFICATION_COOLDOWN"])
);

export type SendMailResponseDto = z.output<typeof SendMailResponseDtoSchema>;
export type SendMailSuccessResponseDto = Extract<SendMailResponseDto, { success: true }>;
export type SendMailErrorResponseDto = Extract<SendMailResponseDto, { success: false }>;
