import { S3StorageService } from "./s3-storage.service";

export class FakeS3StorageService extends S3StorageService {
  shouldFailOnPresigning = false;

  private readonly keysWithPresignedUrl = new Set<string>();
  private readonly objects = new Set<string>();

  // eslint-disable-next-line
  async getUploadUrl(key: string, _expiresIn: number): Promise<string> {
    if (this.shouldFailOnPresigning) {
      throw new Error("S3 failure");
    }
    this.keysWithPresignedUrl.add(key);
    return this.getPresignedUrlForKey(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.objects.has(key);
  }

  async deleteMany(keys: string[]): Promise<void> {
    keys.forEach((key) => this.objects.delete(key));
  }

  /* test methods */

  reset(): void {
    this.objects.clear();
    this.keysWithPresignedUrl.clear();
    this.shouldFailOnPresigning = false;
  }

  put(key: string): void {
    this.objects.add(key);
  }

  isPresignedUrlValid(key: string, url: string): boolean {
    return this.getPresignedUrlForKey(key) === url;
  }

  private getPresignedUrlForKey(key: string): string {
    return `https://fake-s3/${key}`;
  }
}
