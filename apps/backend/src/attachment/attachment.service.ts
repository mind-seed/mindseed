import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type { ConfigType } from "@nestjs/config";
import { Inject } from "@nestjs/common";
import {
  HeadObjectCommand,
  NotFound,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { Attachment } from "./attachment.entity";
import { S3_CLIENT } from "src/s3-storage/s3-storage.module";
import { s3Config } from "src/config";
import {
  AttachmentAlreadyConfirmedError,
  AttachmentNotFoundError,
  AttachmentNotUploadedError,
} from "./attachment.errors";
import { createAttachmentS3Key } from "./attachment-s3-key.helper";

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
    @Inject(S3_CLIENT) private readonly s3Client: S3Client,
    @Inject(s3Config.KEY)
    private readonly s3cfg: ConfigType<typeof s3Config>,
  ) {}

  async beginAttachmentUpload(): Promise<BeginAttachmentUploadResult> {
    const s3Key = createAttachmentS3Key(randomUUID());
    const attachment = await this.attachmentRepository.save(
      this.attachmentRepository.create({ confirmed: false, s3Key }),
    );

    try {
      const presignedUrl = await getSignedUrl(
        this.s3Client,
        new PutObjectCommand({ Bucket: this.s3cfg.bucket!, Key: s3Key }),
        { expiresIn: 600 },
      );
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

    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.s3cfg.bucket!,
          Key: attachment.s3Key,
        }),
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw new AttachmentNotUploadedError();
      }
      throw error;
    }

    attachment.confirmed = true;
    await this.attachmentRepository.save(attachment);
  }
}
