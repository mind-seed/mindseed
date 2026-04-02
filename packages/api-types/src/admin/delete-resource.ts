/*
 DELETE /admin/resources/:id
 Auth: ADMIN role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { ResourceErrorCode } from "../common/error-codes";

export const AdminDeleteResourceResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.enum([ResourceErrorCode.RESOURCE_NOT_FOUND]),
);

export type AdminDeleteResourceResponseDto = z.output<
  typeof AdminDeleteResourceResponseDtoSchema
>;
export type AdminDeleteResourceSuccessResponseDto = Extract<
  AdminDeleteResourceResponseDto,
  { success: true }
>;
export type AdminDeleteResourceErrorResponseDto = Extract<
  AdminDeleteResourceResponseDto,
  { success: false }
>;
