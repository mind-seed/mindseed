import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomUUID } from "crypto";
import { Attachment } from "./attachment.entity";
import { createAttachmentS3Key } from "./attachment-s3-key.helper";
import { S3StorageService } from "src/s3-storage/s3-storage.service";
import {
  AttachmentAlreadyConfirmedError,
  AttachmentNotFoundError,
  AttachmentNotUploadedError,
} from "./attachment.errors";

export type BeginAttachmentUploadResult = {
  attachmentId: number;
  presignedUrl: string;
};

/**
 * AuthController와 1:1로 대응되는, attachment 관련 orchestration logic을
 * 담당한다.
 */
@Injectable()
export class AttachmentService {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    private readonly s3StorageService: S3StorageService,
  ) {}

  async beginAttachmentUpload(): Promise<BeginAttachmentUploadResult> {
    const s3Key = createAttachmentS3Key(randomUUID());
    const attachment = await this.attachmentRepository.save(
      this.attachmentRepository.create({ confirmed: false, s3Key }),
    );

    try {
      const presignedUrl = await this.s3StorageService.getUploadUrl(s3Key, 600);
      return { attachmentId: attachment.id, presignedUrl };
    } catch (error) {
      await this.attachmentRepository.delete(attachment.id);
      throw error;
    }
  }

  async confirmAttachmentUpload(attachmentId: number): Promise<void> {
    const attachment = await this.attachmentRepository.findOneBy({
      id: attachmentId,
    });

    if (!attachment) {
      throw new AttachmentNotFoundError();
    }
    if (attachment.confirmed) {
      throw new AttachmentAlreadyConfirmedError();
    }

    if (!(await this.s3StorageService.exists(attachment.s3Key))) {
      throw new AttachmentNotUploadedError();
    }

    attachment.confirmed = true;
    await this.attachmentRepository.save(attachment);
  }
}
