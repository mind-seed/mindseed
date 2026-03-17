import type { ErrorResponseDto, SuccessResponseDto } from "../shared";

/*
 POST /auth/refresh-tokens
 Authorization: Bearer <refresh token>
 */

export type RefreshTokensSuccessResponseDto = SuccessResponseDto<{
  accessToken: string;
  refreshToken: string;
}>;

export type RefreshTokensErrorCode = "INVALID_REFRESH_TOKEN";

export type RefreshTokensErrorResponseDto =
  ErrorResponseDto<RefreshTokensErrorCode>;

export type RefreshTokensResponseDto =
  | RefreshTokensSuccessResponseDto
  | RefreshTokensErrorResponseDto;
