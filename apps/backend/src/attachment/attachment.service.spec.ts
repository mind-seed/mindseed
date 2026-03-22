import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import PGMem from "pg-mem";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AttachmentService } from "./attachment.service";
import {
  AttachmentAlreadyConfirmedError,
  AttachmentNotFoundError,
  AttachmentNotUploadedError,
} from "./attachment.errors";
import { Attachment } from "./attachment.entity";
import { Post } from "../post/post.entity";
import { User } from "../user/user.entity";
import { UserProfile } from "../user/user-profile.entity";
import { S3_CLIENT } from "src/s3-storage/s3-storage.module";
import { s3Config } from "src/config";
import { initializePgMem } from "src/test/pg-mem.helper";
import { NotFound } from "@aws-sdk/client-s3";

jest.mock("@aws-sdk/s3-request-presigner");

const entities = [UserProfile, User, Post, Attachment];

const mockS3Config = {
  region: "us-east-1",
  accessKeyId: "test-key",
  secretAccessKey: "test-secret",
  bucket: "test-bucket",
};

describe("AttachmentService", () => {
  let module: TestingModule;
  let attachmentService: AttachmentService;
  let attachmentRepository: Repository<Attachment>;
  let mockS3Client: { send: jest.Mock };
  let dataSource: DataSource;
  let dbBackup: PGMem.IBackup;

  beforeAll(async () => {
    const { dataSource: ds, backup } = await initializePgMem(entities);
    dataSource = ds;
    dbBackup = backup;

    mockS3Client = { send: jest.fn() };

    module = await Test.createTestingModule({
      providers: [
        AttachmentService,
        {
          provide: getRepositoryToken(Attachment),
          useValue: dataSource.getRepository(Attachment),
        },
        { provide: S3_CLIENT, useValue: mockS3Client },
        { provide: s3Config.KEY, useValue: mockS3Config },
      ],
    }).compile();

    attachmentService = module.get(AttachmentService);
    attachmentRepository = dataSource.getRepository(Attachment);
  });

  beforeEach(() => {
    dbBackup.restore();
    mockS3Client.send.mockReset();
    jest.mocked(getSignedUrl).mockReset();
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  describe("beginAttachmentUpload", () => {
    it("success: attachment 저장, presigned URL 반환", async () => {
      // Given
      const fakePresignedUrl = "https://s3.example.com/presigned";
      jest.mocked(getSignedUrl).mockResolvedValue(fakePresignedUrl);

      // When
      const result = await attachmentService.beginAttachmentUpload();

      // Then: unconfirmed attachment 저장, presigned URL 반환
      const saved = await attachmentRepository.findOneBy({
        id: result.attachmentId,
      });
      expect(saved).not.toBeNull();
      expect(saved!.confirmed).toBe(false);
      expect(result.presignedUrl).toBe(fakePresignedUrl);
    });

    it("attachment 저장 실패 처리", async () => {
      // Given: DB 저장이 실패하는 경우

      // assumption: entities는 repository.save() 로만 저장됨
      // 2026-03-22 위 엄밀히는 가정은 implementation details에 대한 leak
      // 이지만, tradeoff이라고 생각
      jest
        .spyOn(attachmentRepository, "save")
        .mockRejectedValueOnce(new Error("DB failure"));

      // When
      const result = attachmentService.beginAttachmentUpload();

      // Then: throws, presigned URL 생성하지 않음
      await expect(result).rejects.toThrow();
      expect(jest.mocked(getSignedUrl)).not.toHaveBeenCalled();
    });

    it("presigned URL 생성 실패 처리", async () => {
      // Given: presigned URL 생성이 실패하는 경우
      jest.mocked(getSignedUrl).mockRejectedValueOnce(new Error("S3 failure"));

      // When
      const result = attachmentService.beginAttachmentUpload();

      // Then: throws, attachment DB에 저장되지 않음
      await expect(result).rejects.toThrow();
      expect(await attachmentRepository.count()).toBe(0);
    });
  });

  describe("confirmAttachmentUpload", () => {
    it("success: attachment confirmed 업데이트", async () => {
      // Given: unconfirmed attachment가 존재하고, S3에 upload된 경우
      const attachment = await attachmentRepository.save(
        attachmentRepository.create({
          confirmed: false,
          s3Key: "attachments/1",
        }),
      );
      mockS3Client.send.mockResolvedValue({});

      // When
      await attachmentService.confirmAttachmentUpload(attachment.id);

      // Then: attachment가 confirmed 상태로 업데이트됨
      const updated = await attachmentRepository.findOneBy({
        id: attachment.id,
      });
      expect(updated!.confirmed).toBe(true);
    });

    it("존재하지 않는 attachment 처리", async () => {
      // Given: 존재하지 않는 attachment인 경우
      const nonExistentAttachmentId = 0;

      // When
      const result = attachmentService.confirmAttachmentUpload(
        nonExistentAttachmentId,
      );

      // Then: throws handled error
      await expect(result).rejects.toThrow(AttachmentNotFoundError);
    });

    it("confirmed인 attachment 처리", async () => {
      // Given: attachment가 이미 confirmed인 경우
      const attachment = await attachmentRepository.save(
        attachmentRepository.create({
          confirmed: true,
          s3Key: "attachments/1",
        }),
      );

      // When
      const result = attachmentService.confirmAttachmentUpload(attachment.id);

      // Then: throws handled error
      await expect(result).rejects.toThrow(AttachmentAlreadyConfirmedError);
    });

    it("업로드되지 않은 attachment 처리", async () => {
      // Given: 존재하는 unconfirmed attachment지만, S3에 업로드되지 않은 경우
      const attachment = await attachmentRepository.save(
        attachmentRepository.create({
          confirmed: false,
          s3Key: "attachments/1",
        }),
      );

      mockS3Client.send.mockRejectedValue(Object.create(NotFound.prototype));

      // When
      const result = attachmentService.confirmAttachmentUpload(attachment.id);

      // Then: throws handled error
      await expect(result).rejects.toThrow(AttachmentNotUploadedError);
    });
  });
});
