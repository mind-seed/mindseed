/*
 PATCH /admin/reports/:id
 Auth: ADMIN role
*/

import z from "zod";
import { responseDtoSchema } from "../../helpers";

export const PatchReportRequestDtoSchema = z.object({
  type: z.enum(["DELETE", "STAY"]).optional().default("STAY"),
});

export type PatchReportRequestDto = z.output<
  typeof PatchReportRequestDtoSchema
>;

export const PatchReportResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.never(),
);

export type PatchReportResponseDto = z.output<
  typeof PatchReportResponseDtoSchema
>;
export type PatchReportSuccessResponseDto = Extract<
  PatchReportResponseDto,
  { success: true }
>;
export type PatchReportErrorResponseDto = Extract<
  PatchReportResponseDto,
  { success: false }
>;
