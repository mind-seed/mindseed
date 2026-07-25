import { Injectable, Inject } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import {
  HeadObjectCommand,
  NotFound,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3_CLIENT } from "./s3-client.di-token";
import { s3Config } from "src/config";
import { S3StorageService } from "./s3-storage.service";
import { InjectRepository } from "@nestjs/typeorm";
import { S3Queue } from "./entities/s3-queue";
import { Repository } from "typeorm";

// 2026-03-26 testability를 위해 wrapper class 작성

@Injectable()
export class S3ClientStorageService extends S3StorageService {
  constructor(
    @Inject(S3_CLIENT) private readonly s3Client: S3Client,
    @Inject(s3Config.KEY)
    private readonly s3cfg: ConfigType<typeof s3Config>,
    @InjectRepository(S3Queue)
    private readonly s3QueueRepository: Repository<S3Queue>,
  ) {
    super();
  }

  async getUploadUrl(key: string, expiresIn: number): Promise<string> {
    return getSignedUrl(
      this.s3Client,
      new PutObjectCommand({ Bucket: this.s3cfg.bucket!, Key: key }),
      { expiresIn },
    );
  }

  getPublicUrl(key: string): string {
    return `https://${this.s3cfg.endpoint}/${this.s3cfg.bucket}/${key}`;
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({ Bucket: this.s3cfg.bucket!, Key: key }),
      );
      return true;
    } catch (error) {
      if (error instanceof NotFound) {
        return false;
      }
      throw error;
    }
  }

  async deleteMany(keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }

    /**
     * 일시적인 DB 장애가 있을 수 있으므로 재시도 로직을 구현함.
     * 하나의 실패가 모든 큐를 실패로 만들 수 있으므로, 각 큐를 개별적으로 처리하도록 함.
     * 실패한 항목에 대해서는 로그를 남겨 나중에 디버깅 가능하도록 수정
     */
    for (const key of keys) {
      try {
        await this.s3QueueRepository.save({
          attachmentKey: key,
        });
      } catch (e) {
        try {
          await this.s3QueueRepository.save({
            attachmentKey: key,
          });
        } catch (e) {
          console.error(
            `[S3ClientStorageService] failed to enqueue key=${key} for deletion, error=${e}`,
          );
        }
      }
    }

    // await this.s3Client.send(
    //   new DeleteObjectsCommand({
    //     Bucket: this.s3cfg.bucket,
    //     Delete: {
    //       Objects: keys.map((key) => ({ Key: key })),
    //     },
    //   }),
    // );
  }
}
