/*
 DELETE /users/current
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";

export const DeleteCurrentUserResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.never(),
);

export type DeleteCurrentUserResponseDto = z.output<
  typeof DeleteCurrentUserResponseDtoSchema
>;
export type DeleteCurrentUserSuccessResponseDto = Extract<
  DeleteCurrentUserResponseDto,
  { success: true }
>;
export type DeleteCurrentUserErrorResponseDto = Extract<
  DeleteCurrentUserResponseDto,
  { success: false }
>;
