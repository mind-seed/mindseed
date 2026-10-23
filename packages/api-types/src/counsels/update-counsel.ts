/*
 PUT /counsels/:id
 Auth: USER role
*/

import z from "zod";
import { responseDtoSchema } from "../helpers";
import {
  CounselCategorySchema,
  CounselContentSchema,
  CounselTitleSchema,
} from "../common/counsel";
import { CounselErrorCode } from "../common/error-codes";

export const UpdateCounselRequestDtoSchema = z.object({
  title: CounselTitleSchema,
  content: CounselContentSchema,
  category: CounselCategorySchema,
});

export type UpdateCounselRequestDto = z.output<
  typeof UpdateCounselRequestDtoSchema
>;

export const UpdateCounselResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.enum([
    CounselErrorCode.COUNSEL_NOT_FOUND,
    CounselErrorCode.NOT_COUNSEL_AUTHOR,
  ]),
);

export type UpdateCounselResponseDto = z.output<
  typeof UpdateCounselResponseDtoSchema
>;
export type UpdateCounselSuccessResponseDto = Extract<
  UpdateCounselResponseDto,
  { success: true }
>;
export type UpdateCounselErrorResponseDto = Extract<
  UpdateCounselResponseDto,
  { success: false }
>;
