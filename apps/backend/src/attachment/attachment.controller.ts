import { Controller, Post, HttpCode, HttpStatus } from "@nestjs/common";
import {
  BeginAttachmentUploadResponseDtoSchema,
  ConfirmAttachmentUploadRequestDtoSchema,
  ConfirmAttachmentUploadResponseDtoSchema,
} from "@mindseed/api-types";
import type {
  BeginAttachmentUploadSuccessResponseDto,
  ConfirmAttachmentUploadRequestDto,
  ConfirmAttachmentUploadSuccessResponseDto,
} from "@mindseed/api-types";
import { AttachmentService } from "./attachment.service";
import { ZodBody } from "src/common/pipes/zod-validation.decorator";
import { ZodEncodeResponse } from "src/common/interceptors/zod-encode-response.decorator";
import { UserOnly } from "src/auth/decorators/auth.decorators";

@Controller("/attachments")
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post("/begin")
  @HttpCode(HttpStatus.CREATED)
  @UserOnly()
  @ZodEncodeResponse(BeginAttachmentUploadResponseDtoSchema)
  async beginAttachmentUpload(): Promise<BeginAttachmentUploadSuccessResponseDto> {
    const result = await this.attachmentService.beginAttachmentUpload();
    return { success: true, data: result };
  }

  @Post("/confirm")
  @HttpCode(HttpStatus.OK)
  @UserOnly()
  @ZodEncodeResponse(ConfirmAttachmentUploadResponseDtoSchema)
  async confirmAttachmentUpload(
    @ZodBody(ConfirmAttachmentUploadRequestDtoSchema)
    body: ConfirmAttachmentUploadRequestDto,
  ): Promise<ConfirmAttachmentUploadSuccessResponseDto> {
    await this.attachmentService.confirmAttachmentUpload(body.attachmentId);
    return { success: true, data: null };
  }
}
