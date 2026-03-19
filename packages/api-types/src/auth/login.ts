import z from "zod";
import { responseDtoSchema, dateTimeCodec } from "../shared";

/*
 POST /auth/login
 */

export const LoginRequestDtoSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export type LoginRequestDto = z.output<typeof LoginRequestDtoSchema>;

export const UserProfileDtoSchema = z.object({
  nickname: z.string(),
  age: z.int(),
});

export type UserProfileDto = z.output<typeof UserProfileDtoSchema>;

// invariant: profile은 role === "ADMIN" 일 때만 null이다.
export const UserDtoSchema = z.object({
  id: z.int(),
  email: z.email(),
  role: z.enum(["USER", "ADMIN"]),
  createdAt: dateTimeCodec,
  profile: UserProfileDtoSchema.nullable(),
});

export type UserDto = z.output<typeof UserDtoSchema>;

export const LoginResponseDtoSchema = responseDtoSchema(
  z.object({
    user: UserDtoSchema,
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
  z.enum(["INVALID_CREDENTIALS"])
);

export type LoginResponseDto = z.output<typeof LoginResponseDtoSchema>;
export type LoginSuccessResponseDto = Extract<LoginResponseDto, { success: true }>;
export type LoginErrorResponseDto = Extract<LoginResponseDto, { success: false }>;
