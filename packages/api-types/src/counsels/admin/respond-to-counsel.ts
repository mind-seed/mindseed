/*
 POST /admin/counsels/:id/response
 Auth: ADMIN role
*/

import z from "zod";
import { responseDtoSchema } from "src/helpers";
import { CounselResponseSchema } from "src/common/counsel";
import { CounselErrorCode } from "src/common/error-codes";

export const AdminRespondToCounselRequestDtoSchema = z.object({
  response: CounselResponseSchema,
});

export type AdminRespondToCounselRequestDto = z.output<
  typeof AdminRespondToCounselRequestDtoSchema
>;

export const AdminRespondToCounselResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.enum([
    CounselErrorCode.COUNSEL_NOT_FOUND,
    CounselErrorCode.COUNSEL_ALREADY_RESPONDED,
  ]),
);

export type AdminRespondToCounselResponseDto = z.output<
  typeof AdminRespondToCounselResponseDtoSchema
>;
export type AdminRespondToCounselSuccessResponseDto = Extract<
  AdminRespondToCounselResponseDto,
  { success: true }
>;
export type AdminRespondToCounselErrorResponseDto = Extract<
  AdminRespondToCounselResponseDto,
  { success: false }
>;
