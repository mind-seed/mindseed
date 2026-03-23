/*
 POST /attachments/begin
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";

export const BeginAttachmentUploadResponseDtoSchema = responseDtoSchema(
  z.object({
    attachmentId: z.int(),
    presignedUrl: z.url(),
  }),
  z.enum([]),
);

export type BeginAttachmentUploadResponseDto = z.output<
  typeof BeginAttachmentUploadResponseDtoSchema
>;
export type BeginAttachmentUploadSuccessResponseDto = Extract<
  BeginAttachmentUploadResponseDto,
  { success: true }
>;
export type BeginAttachmentUploadErrorResponseDto = Extract<
  BeginAttachmentUploadResponseDto,
  { success: false }
>;
