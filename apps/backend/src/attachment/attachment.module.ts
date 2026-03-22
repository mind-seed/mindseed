import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Attachment } from "./attachment.entity";
import { AttachmentService } from "./attachment.service";
import { S3StorageModule } from "src/s3-storage/s3-storage.module";

@Module({
  imports: [TypeOrmModule.forFeature([Attachment]), S3StorageModule],
  providers: [AttachmentService],
})
export class AttachmentModule {}
