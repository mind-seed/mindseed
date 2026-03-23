/*
 GET /posts/:id
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { PostDtoSchema, PostNotFoundErrorCode } from "./common";

export const GetPostResponseDtoSchema = responseDtoSchema(
  PostDtoSchema,
  z.enum([PostNotFoundErrorCode])
);

export type GetPostResponseDto = z.output<typeof GetPostResponseDtoSchema>;
export type GetPostSuccessResponseDto = Extract<GetPostResponseDto, { success: true }>;
export type GetPostErrorResponseDto = Extract<GetPostResponseDto, { success: false }>;
