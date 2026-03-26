import { Injectable, Inject } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import {
  DeleteObjectsCommand,
  HeadObjectCommand,
  NotFound,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3_CLIENT } from "./s3-client.di-token";
import { s3Config } from "src/config";
import { S3StorageService } from "./s3-storage.service";

// 2026-03-26 testability를 위해 wrapper class 작성

@Injectable()
export class S3ClientStorageService extends S3StorageService {
  constructor(
    @Inject(S3_CLIENT) private readonly s3Client: S3Client,
    @Inject(s3Config.KEY)
    private readonly s3cfg: ConfigType<typeof s3Config>,
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

    await this.s3Client.send(
      new DeleteObjectsCommand({
        Bucket: this.s3cfg.bucket,
        Delete: {
          Objects: keys.map((key) => ({ Key: key })),
        },
      }),
    );
  }
}
