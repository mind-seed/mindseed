/*
 POST /attachments/confirm
 Auth: USER role
 */

import z from "zod";
import { responseDtoSchema } from "../helpers";
import { AttachmentErrorCode } from "../common/error-codes";

export const ConfirmAttachmentUploadRequestDtoSchema = z.object({
  attachmentId: z.int(),
});

export type ConfirmAttachmentUploadRequestDto = z.output<
  typeof ConfirmAttachmentUploadRequestDtoSchema
>;

export const ConfirmAttachmentUploadResponseDtoSchema = responseDtoSchema(
  z.null(),
  z.enum([
    AttachmentErrorCode.ATTACHMENT_NOT_FOUND,
    AttachmentErrorCode.ATTACHMENT_ALREADY_CONFIRMED,
    AttachmentErrorCode.ATTACHMENT_NOT_UPLOADED,
  ]),
);

export type ConfirmAttachmentUploadResponseDto = z.output<
  typeof ConfirmAttachmentUploadResponseDtoSchema
>;
export type ConfirmAttachmentUploadSuccessResponseDto = Extract<
  ConfirmAttachmentUploadResponseDto,
  { success: true }
>;
export type ConfirmAttachmentUploadErrorResponseDto = Extract<
  ConfirmAttachmentUploadResponseDto,
  { success: false }
>;
