import z from "zod";
import type { ErrorResponseDto, SuccessResponseDto } from "../shared";
import type { EmailAlreadyExistsErrorCode } from "./common";

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
