import z from "zod";
import type { ErrorResponseDto, SuccessResponseDto } from "../shared";

/*
 POST /auth/login
 */

export const LoginRequestDtoSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export type LoginRequestDto = z.infer<typeof LoginRequestDtoSchema>;

export type UserProfileDto = {
  nickname: string;
  age: number;
};

export type UserDto = {
  id: number;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  profile: UserProfileDto;
};

export type LoginSuccessResponseDto = SuccessResponseDto<{
  user: UserDto;
  accessToken: string;
  refreshToken: string;
}>;

export type LoginErrorCode = "INVALID_CREDENTIALS";

export type LoginErrorResponseDto = ErrorResponseDto<LoginErrorCode>;

export type LoginResponseDto = LoginSuccessResponseDto | LoginErrorResponseDto;
