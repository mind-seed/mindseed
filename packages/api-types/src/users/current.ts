import z from "zod";
import { responseDtoSchema } from "../shared";
import { UserDtoSchema } from "../auth/login";

/*
 GET /users/current
 */

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
