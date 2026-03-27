import { Injectable } from "@nestjs/common";

/**
 * S3 storage에 대한 wrapper class
 */
@Injectable()
export abstract class S3StorageService {
  abstract getUploadUrl(key: string, expiresIn: number): Promise<string>;
  abstract getPublicUrl(key: string): string;
  abstract exists(key: string): Promise<boolean>;
  abstract deleteMany(keys: string[]): Promise<void>;
}
