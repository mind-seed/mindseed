/*
 POST /auth/logout
 Auth: any authenticated user
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";

export const LogoutResponseDtoSchema = responseDtoSchema(z.null(), z.never());

export type LogoutResponseDto = z.output<typeof LogoutResponseDtoSchema>;
export type LogoutSuccessResponseDto = Extract<
  LogoutResponseDto,
  { success: true }
>;
