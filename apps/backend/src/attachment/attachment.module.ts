import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Attachment } from "./attachment.entity";
import { AttachmentService } from "./attachment.service";
import { S3StorageModule } from "src/s3-storage/s3-storage.module";
import { AuthModule } from "src/auth/auth.module";
import { UserModule } from "src/user/user.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Attachment]),
    S3StorageModule,
    AuthModule,
    UserModule,
  ],
  providers: [AttachmentService],
})
export class AttachmentModule {}
