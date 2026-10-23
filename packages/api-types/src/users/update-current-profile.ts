/*
 PATCH /users/current/profile
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { NicknameSchema } from "../common/user";

export const UpdateCurrentUserRequestDtoSchema = z
  .object({
    nickname: NicknameSchema,
    characterIndex: z.int(),
  })
  .partial();

export type UpdateCurrentUserRequestDto = z.output<
  typeof UpdateCurrentUserRequestDtoSchema
>;

export const UpdateCurrentUserResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.never(),
);

export type UpdateCurrentUserResponseDto = z.output<
  typeof UpdateCurrentUserResponseDtoSchema
>;
export type UpdateCurrentUserSuccessResponseDto = Extract<
  UpdateCurrentUserResponseDto,
  { success: true }
>;
export type UpdateCurrentUserErrorResponseDto = Extract<
  UpdateCurrentUserResponseDto,
  { success: false }
>;
