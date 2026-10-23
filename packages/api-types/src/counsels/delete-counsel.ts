/*
 DELETE /counsels/:id
 Auth: USER role
*/

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { CounselErrorCode } from "../common/error-codes";

export const DeleteCounselResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.enum([
    CounselErrorCode.COUNSEL_NOT_FOUND,
    CounselErrorCode.NOT_COUNSEL_AUTHOR,
  ]),
);

export type DeleteCounselResponseDto = z.output<
  typeof DeleteCounselResponseDtoSchema
>;
export type DeleteCounselSuccessResponseDto = Extract<
  DeleteCounselResponseDto,
  { success: true }
>;
export type DeleteCounselErrorResponseDto = Extract<
  DeleteCounselResponseDto,
  { success: false }
>;
