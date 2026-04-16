/*
 GET /counsels/:id
 Auth: USER role
*/

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { CounselDtoSchema } from "../common/counsel";
import { CounselErrorCode } from "../common/error-codes";

export const GetCounselResponseDtoSchema = responseDtoSchema(
  CounselDtoSchema,
  z.enum([CounselErrorCode.COUNSEL_NOT_FOUND]),
);

export type GetCounselResponseDto = z.output<
  typeof GetCounselResponseDtoSchema
>;
export type GetCounselSuccessResponseDto = Extract<
  GetCounselResponseDto,
  { success: true }
>;
export type GetCounselErrorResponseDto = Extract<
  GetCounselResponseDto,
  { success: false }
>;
