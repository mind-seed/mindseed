/*
  GET /diagnoses
  Auth: USER role
*/

import z from "zod";
import { responseDtoSchema } from "src/helpers";
import { DiagnosisErrorCode } from "src/common/error-codes";

export const GetDiagnosisResponseDtoSchema = responseDtoSchema(
  z.object({
    depressionScore: z.int(),
    anxietyScore: z.int(),
    stressScore: z.int(),
  }),
  z.enum([DiagnosisErrorCode.DIAGNOSIS_NOT_FOUND]),
);

export type GetDiagnosisResponseDto = z.output<
  typeof GetDiagnosisResponseDtoSchema
>;
export type GetDiagnosisSuccessResponseDto = Extract<
  GetDiagnosisResponseDto,
  { success: true }
>;
export type GetDiagnosisErrorResponseDto = Extract<
  GetDiagnosisResponseDto,
  { success: false }
>;
