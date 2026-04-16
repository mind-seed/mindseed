/*
 GET /admin/counsels/:id
 Auth: ADMIN role
*/

import z from "zod";
import { responseDtoSchema } from "src/helpers";
import { CounselDtoSchema } from "src/common/counsel";
import { CounselErrorCode } from "src/common/error-codes";

export const AdminGetCounselResponseDtoSchema = responseDtoSchema(
  CounselDtoSchema,
  z.enum([CounselErrorCode.COUNSEL_NOT_FOUND]),
);

export type AdminGetCounselResponseDto = z.output<
  typeof AdminGetCounselResponseDtoSchema
>;
export type AdminGetCounselSuccessResponseDto = Extract<
  AdminGetCounselResponseDto,
  { success: true }
>;
export type AdminGetCounselErrorResponseDto = Extract<
  AdminGetCounselResponseDto,
  { success: false }
>;
