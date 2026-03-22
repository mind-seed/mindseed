import { Module } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { S3Client } from "@aws-sdk/client-s3";
import { s3Config } from "src/config";

export const S3_CLIENT = Symbol("S3_CLIENT");

@Module({
  providers: [
    {
      provide: S3_CLIENT,
      inject: [s3Config.KEY],
      useFactory: (config: ConfigType<typeof s3Config>) =>
        new S3Client({
          region: config.region,
          credentials: {
            accessKeyId: config.accessKeyId!,
            secretAccessKey: config.secretAccessKey!,
          },
        }),
    },
  ],
  exports: [S3_CLIENT],
})
export class S3StorageModule {}
