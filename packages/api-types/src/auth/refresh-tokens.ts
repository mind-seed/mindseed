/*
 POST /auth/refresh-tokens
 Authorization: Bearer <refresh token>
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";

export const RefreshTokensResponseDtoSchema = responseDtoSchema(
  z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
  z.enum(["INVALID_REFRESH_TOKEN"]),
);

export type RefreshTokensResponseDto = z.output<
  typeof RefreshTokensResponseDtoSchema
>;
export type RefreshTokensSuccessResponseDto = Extract<
  RefreshTokensResponseDto,
  { success: true }
>;
export type RefreshTokensErrorResponseDto = Extract<
  RefreshTokensResponseDto,
  { success: false }
>;
