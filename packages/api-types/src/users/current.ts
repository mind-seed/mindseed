/*
 GET /users/current
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { UserDtoSchema } from "../common/user-dto";

export const GetCurrentUserResponseDtoSchema = responseDtoSchema(
  UserDtoSchema,
  z.enum([]),
);

export type GetCurrentUserResponseDto = z.output<
  typeof GetCurrentUserResponseDtoSchema
>;
export type GetCurrentUserSuccessResponseDto = Extract<
  GetCurrentUserResponseDto,
  { success: true }
>;
export type GetCurrentUserErrorResponseDto = Extract<
  GetCurrentUserResponseDto,
  { success: false }
>;
