import { Module } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { S3Client } from "@aws-sdk/client-s3";
import { s3Config } from "src/config";
import { S3StorageService } from "./s3-storage.service";
import { S3ClientStorageService } from "./s3-client-storage.service";
import { S3_CLIENT } from "./s3-client.di-token";

@Module({
  providers: [
    { provide: S3StorageService, useClass: S3ClientStorageService },
    {
      provide: S3_CLIENT,
      inject: [s3Config.KEY],
      useFactory: (config: ConfigType<typeof s3Config>) =>
        new S3Client({
          region: config.region,
          endpoint: config.endpoint,
          credentials: {
            accessKeyId: config.accessKeyId!,
            secretAccessKey: config.secretAccessKey!,
          },
        }),
    },
  ],
  exports: [S3StorageService],
})
export class S3StorageModule {}
