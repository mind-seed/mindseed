/*
 POST /diagnoses
 Auth: USER role
*/

import z from "zod";
import { responseDtoSchema } from "src/helpers";

export const CreateDiagnosisRequestDtoSchema = z.object({
  depressionScore: z.int().min(0).max(100),
  anxietyScore: z.int().min(0).max(100),
  stressScore: z.int().min(0).max(100),
});

export type CreateDiagnosisRequestDto = z.output<
  typeof CreateDiagnosisRequestDtoSchema
>;

export const CreateDiagnosisResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.never(),
);

export type CreateDiagnosisResponseDto = z.output<
  typeof CreateDiagnosisResponseDtoSchema
>;
export type CreateDiagnosisSuccessResponseDto = Extract<
  CreateDiagnosisResponseDto,
  { success: true }
>;
