/*
 DELETE /posts/:id
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { PostNotFoundErrorCode, NotPostAuthorErrorCode } from "./common";

export const DeletePostResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.enum([PostNotFoundErrorCode, NotPostAuthorErrorCode])
);

export type DeletePostResponseDto = z.output<typeof DeletePostResponseDtoSchema>;
export type DeletePostSuccessResponseDto = Extract<DeletePostResponseDto, { success: true }>;
export type DeletePostErrorResponseDto = Extract<DeletePostResponseDto, { success: false }>;
