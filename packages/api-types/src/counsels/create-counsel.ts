/*
 POST /counsels
 Auth: USER role
*/

import z from "zod";
import { responseDtoSchema } from "../helpers";
import {
  CounselCategorySchema,
  CounselContentSchema,
  CounselTitleSchema,
} from "../common/counsel";

export const CreateCounselRequestDtoSchema = z.object({
  title: CounselTitleSchema,
  content: CounselContentSchema,
  category: CounselCategorySchema,
});

export type CreateCounselRequestDto = z.output<
  typeof CreateCounselRequestDtoSchema
>;

export const CreateCounselResponseDtoSchema = responseDtoSchema(
  z.object({ id: z.int() }),
  z.never(),
);

export type CreateCounselResponseDto = z.output<
  typeof CreateCounselResponseDtoSchema
>;
export type CreateCounselSuccessResponseDto = Extract<
  CreateCounselResponseDto,
  { success: true }
>;
export type CreateCounselErrorResponseDto = Extract<
  CreateCounselResponseDto,
  { success: false }
>;
