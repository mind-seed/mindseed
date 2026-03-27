import { Test, TestingModule } from "@nestjs/testing";
import { getDataSourceToken, getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import PGMem from "pg-mem";
import { randomUUID } from "crypto";
import { PostMutationService } from "./post-mutation.service";
import {
  AttachmentAlreadyAssociatedError,
  AttachmentNotFoundError,
  NotPostAuthorError,
  PostNotFoundError,
} from "./post.errors";
import { Post, PostCategory } from "./post.entity";
import { PostLike } from "./post-like.entity";
import { Attachment } from "../attachment/attachment.entity";
import { User, UserRole } from "../user/user.entity";
import { UserProfile } from "../user/user-profile.entity";
import { S3StorageService } from "src/s3-storage/s3-storage.service";
import { FakeS3StorageService } from "src/s3-storage/s3-storage.service.fake";
import { initializePgMem } from "src/test/pg-mem.helper";

const entities = [UserProfile, User, Post, PostLike, Attachment];

let userCounter = 0;

async function saveTestUser(
  repository: Repository<User>,
  overrides?: Partial<User>,
): Promise<User> {
  return repository.save(
    repository.create({
      email: `user${++userCounter}@test.com`,
      password: "password",
      role: UserRole.USER,
      ...overrides,
    }),
  );
}

async function saveTestPost(
  repository: Repository<Post>,
  userId: number,
  overrides?: Partial<Post>,
): Promise<Post> {
  return repository.save(
    repository.create({
      content: "test content",
      category: PostCategory.DUMMY1,
      nickname: "testnick",
      author: { id: userId } as User,
      ...overrides,
    }),
  );
}

async function saveTestAttachment(
  repository: Repository<Attachment>,
  overrides?: Partial<Attachment>,
): Promise<Attachment> {
  return repository.save(
    repository.create({
      confirmed: true,
      s3Key: `attachments/${randomUUID()}`,
      index: null,
      post: null,
      ...overrides,
    }),
  );
}

describe("PostMutationService", () => {
  let module: TestingModule;
  let postMutationService: PostMutationService;
  let postRepository: Repository<Post>;
  let postLikeRepository: Repository<PostLike>;
  let attachmentRepository: Repository<Attachment>;
  let userRepository: Repository<User>;
  let fakeS3: FakeS3StorageService;
  let dataSource: DataSource;
  let dbBackup: PGMem.IBackup;

  beforeAll(async () => {
    const { dataSource: ds, backup } = await initializePgMem(entities);
    dataSource = ds;
    dbBackup = backup;

    fakeS3 = new FakeS3StorageService();

    module = await Test.createTestingModule({
      providers: [
        PostMutationService,
        {
          provide: getRepositoryToken(Post),
          useValue: dataSource.getRepository(Post),
        },
        {
          provide: getRepositoryToken(PostLike),
          useValue: dataSource.getRepository(PostLike),
        },
        {
          provide: getRepositoryToken(Attachment),
          useValue: dataSource.getRepository(Attachment),
        },
        {
          provide: getDataSourceToken(),
          useValue: dataSource,
        },
        { provide: S3StorageService, useValue: fakeS3 },
      ],
    }).compile();

    postMutationService = module.get(PostMutationService);
    postRepository = dataSource.getRepository(Post);
    postLikeRepository = dataSource.getRepository(PostLike);
    attachmentRepository = dataSource.getRepository(Attachment);
    userRepository = dataSource.getRepository(User);
  });

  beforeEach(() => {
    dbBackup.restore();
    fakeS3.reset();
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  describe("createPost", () => {
    it("success: 글 생성, attachment 업데이트", async () => {
      // Given: confirmed이며 associated 되지 않은 attachment 존재
      const user = await saveTestUser(userRepository);
      const a1 = await saveTestAttachment(attachmentRepository);
      const a2 = await saveTestAttachment(attachmentRepository);

      // When: 글 생성 시도
      const post = await postMutationService.createPost({
        userId: user.id,
        content: "hello",
        nickname: "nick",
        category: PostCategory.DUMMY1,
        attachmentIds: [a1.id, a2.id],
      });

      // Then: 글 생성, attachment 업데이트
      const savedPost = await postRepository.findOne({
        where: { id: post.id },
        relations: ["attachments"],
      });
      expect(savedPost).not.toBeNull();
      expect(savedPost!.attachments.map((a) => a.id)).toEqual(
        expect.arrayContaining([a1.id, a2.id]),
      );
    });

    it("존재하지 않는 attachment 처리", async () => {
      // Given: 존재하지 않는 attachment인 경우
      const user = await saveTestUser(userRepository);
      const nonExistentAttachmentId = 0;

      // When: 글 생성 시도
      const result = postMutationService.createPost({
        userId: user.id,
        content: "hello",
        nickname: "nick",
        category: PostCategory.DUMMY1,
        attachmentIds: [nonExistentAttachmentId],
      });

      // Then: throws handled error
      await expect(result).rejects.toThrow(AttachmentNotFoundError);
    });

    it("confirmed 되지 않은 attachment 처리", async () => {
      // Given: confirmed 되지 않은 attachment인 경우
      const user = await saveTestUser(userRepository);
      const attachment = await saveTestAttachment(attachmentRepository, {
        confirmed: false,
      });

      // When: 글 생성 시도
      const result = postMutationService.createPost({
        userId: user.id,
        content: "hello",
        nickname: "nick",
        category: PostCategory.DUMMY1,
        attachmentIds: [attachment.id],
      });

      // Then: throws handled error, 글 생성되지 않음
      await expect(result).rejects.toThrow(AttachmentNotFoundError);
      expect(await postRepository.count()).toBe(0);
    });

    it("이미 associated 된 attachment 처리", async () => {
      // Given: attachment가 이미 associated된 경우
      const user = await saveTestUser(userRepository);
      const existingPost = await saveTestPost(postRepository, user.id);
      const attachment = await saveTestAttachment(attachmentRepository, {
        post: existingPost,
      });

      // When: 글 생성 시도
      const result = postMutationService.createPost({
        userId: user.id,
        content: "hello",
        nickname: "nick",
        category: PostCategory.DUMMY1,
        attachmentIds: [attachment.id],
      });

      // Then: throws handled error, 글 생성되지 않음
      await expect(result).rejects.toThrow(AttachmentAlreadyAssociatedError);
      expect(await postRepository.count()).toBe(1); // only the existing post
    });
  });

  describe("updatePost", () => {
    it("success: 글 업데이트 및 old attachment들 삭제", async () => {
      // Given: 존재하는 글 및 owner인 경우
      const user = await saveTestUser(userRepository);
      const post = await saveTestPost(postRepository, user.id);
      const oldAttachment = await saveTestAttachment(attachmentRepository, {
        post,
      });
      fakeS3.put(oldAttachment.s3Key);

      // Given: new attachments가 confirmed이며 associated 되지 않은 경우
      const newAttachment = await saveTestAttachment(attachmentRepository);

      // When: 글 업데이트 시도
      await postMutationService.updatePost({
        userId: user.id,
        postId: post.id,
        content: "updated content",
        category: PostCategory.DUMMY2,
        attachmentIds: [newAttachment.id],
      });

      // Then: 글 및 new attachments 업데이트됨
      const updatedPost = await postRepository.findOne({
        where: { id: post.id },
        relations: ["attachments"],
      });
      expect(updatedPost).toMatchObject({
        content: "updated content",
        category: PostCategory.DUMMY2,
      });
      expect(updatedPost!.attachments.map((a) => a.id)).toEqual(
        expect.arrayContaining([newAttachment.id]),
      );

      // Then: old attachments 삭제
      expect(
        await attachmentRepository.findOneBy({ id: oldAttachment.id }),
      ).toBeNull();
      expect(await fakeS3.exists(oldAttachment.s3Key)).toBe(false);
    });

    it("존재하지 않는 글 처리", async () => {
      // Given: 글이 존재하지 않는 경우

      // When: 글 업데이트 시도
      const result = postMutationService.updatePost({
        userId: 0,
        postId: 0,
        content: "content",
        category: PostCategory.DUMMY1,
        attachmentIds: [],
      });

      // Then: throws handled error
      await expect(result).rejects.toThrow(PostNotFoundError);
    });

    it("글 owner가 아닌 경우 처리", async () => {
      // Given: 글이 존재하지만, owner가 일치하지 않는 경우
      const author = await saveTestUser(userRepository);
      const otherUser = await saveTestUser(userRepository);
      const post = await saveTestPost(postRepository, author.id);

      // When: 글 업데이트 시도
      const result = postMutationService.updatePost({
        userId: otherUser.id,
        postId: post.id,
        content: "content",
        category: PostCategory.DUMMY1,
        attachmentIds: [],
      });

      // Then: throws handled error
      await expect(result).rejects.toThrow(NotPostAuthorError);
    });

    it("존재하지 않는 new attachment 처리", async () => {
      // Given: 존재하는 글 및 owner인 경우
      const user = await saveTestUser(userRepository);
      const post = await saveTestPost(postRepository, user.id);

      // Given: new attachment가 존재하지 않을 경우
      const nonExistentAttachmentId = 0;

      // When: 글 업데이트 시도
      const result = postMutationService.updatePost({
        userId: user.id,
        postId: post.id,
        content: "content",
        category: PostCategory.DUMMY1,
        attachmentIds: [nonExistentAttachmentId],
      });

      // Then: throws handled error
      await expect(result).rejects.toThrow(AttachmentNotFoundError);
    });

    it("confirmed 되지 않은 새 attachment 처리", async () => {
      // Given: 존재하는 글 및 owner인 경우
      const user = await saveTestUser(userRepository);
      const post = await saveTestPost(postRepository, user.id);

      // Given: new attachments가 confirmed가 아닌 경우
      const attachment = await saveTestAttachment(attachmentRepository, {
        confirmed: false,
      });

      // When: 글 업데이트 시도
      const result = postMutationService.updatePost({
        userId: user.id,
        postId: post.id,
        content: "content",
        category: PostCategory.DUMMY1,
        attachmentIds: [attachment.id],
      });

      // Then: throws handled error
      await expect(result).rejects.toThrow(AttachmentNotFoundError);
    });

    it("이미 associated 된 새 attachment 처리", async () => {
      // Given: 존재하는 글 및 owner인 경우
      const user = await saveTestUser(userRepository);
      const post = await saveTestPost(postRepository, user.id);
      const otherPost = await saveTestPost(postRepository, user.id);

      // Given: new attachments가 confirmed 되었지만, associated 된 경우
      const attachment = await saveTestAttachment(attachmentRepository, {
        post: otherPost,
      });

      // When: 글 업데이트 시도
      const result = postMutationService.updatePost({
        userId: user.id,
        postId: post.id,
        content: "content",
        category: PostCategory.DUMMY1,
        attachmentIds: [attachment.id],
      });

      // Then: throws handled error
      await expect(result).rejects.toThrow(AttachmentAlreadyAssociatedError);
    });
  });

  describe("setPostLike", () => {
    it("success: liked false -> true, post like entity 생성", async () => {
      // Given: 글이 존재하는 경우, liked: false
      const user = await saveTestUser(userRepository);
      const post = await saveTestPost(postRepository, user.id);

      // When: liked를 true로 지정하여 요청
      await postMutationService.setPostLike(user.id, post.id, true);

      // Then: post like entity 생성, likeCount 업데이트
      const like = await postLikeRepository.findOneBy({
        post: { id: post.id },
        user: { id: user.id },
      });
      expect(like).not.toBeNull();
      const updatedPost = await postRepository.findOneBy({
        id: post.id,
      });
      expect(updatedPost!.likeCount).toBe(1);
    });

    it("success: liked true -> true, post like entity 유지", async () => {
      // Given: 글이 존재하는 경우, liked: true
      const user = await saveTestUser(userRepository);
      const post = await saveTestPost(postRepository, user.id, {
        likeCount: 1,
      });
      await postLikeRepository.save(
        postLikeRepository.create({
          user: { id: user.id },
          post: { id: post.id },
        }),
      );

      // When: liked를 true로 지정하여 요청
      await postMutationService.setPostLike(user.id, post.id, true);

      // Then: post like entity 유지, likeCount 유지
      const like = await postLikeRepository.findOne({
        where: { post: { id: post.id }, user: { id: user.id } },
      });
      expect(like).not.toBeNull();
      const updatedPost = await postRepository.findOneBy({ id: post.id });
      expect(updatedPost!.likeCount).toBe(1);
    });

    it("success: liked true -> false, post like entity 삭제", async () => {
      // Given: 글이 존재하는 경우, liked: true
      const user = await saveTestUser(userRepository);
      const post = await saveTestPost(postRepository, user.id, {
        likeCount: 1,
      });
      await postLikeRepository.save(
        postLikeRepository.create({
          user: { id: user.id },
          post: { id: post.id },
        }),
      );

      // When: liked를 false로 지정하여 요청
      await postMutationService.setPostLike(user.id, post.id, false);

      // Then: post like entity 삭제, likeCount 업데이트
      const like = await postLikeRepository.findOne({
        where: { post: { id: post.id }, user: { id: user.id } },
      });
      expect(like).toBeNull();
      const updatedPost = await postRepository.findOneBy({ id: post.id });
      expect(updatedPost!.likeCount).toBe(0);
    });

    it("success: liked false -> false, post like entity 없음 유지", async () => {
      // Given: 글이 존재하는 경우, liked: false
      const user = await saveTestUser(userRepository);
      const post = await saveTestPost(postRepository, user.id);

      // When: liked를 false로 지정하여 요청
      await postMutationService.setPostLike(user.id, post.id, false);

      // Then: post like entity 없음 유지, likeCount 유지
      const like = await postLikeRepository.findOne({
        where: { post: { id: post.id }, user: { id: user.id } },
      });
      expect(like).toBeNull();
      const updatedPost = await postRepository.findOneBy({ id: post.id });
      expect(updatedPost!.likeCount).toBe(0);
    });

    it("존재하지 않는 글 처리", async () => {
      // Given: 글이 존재하지 않는 경우
      const user = await saveTestUser(userRepository);

      // When: liked 요청 시도
      const result = postMutationService.setPostLike(user.id, 0, true);

      // Then: throws handled error
      await expect(result).rejects.toThrow(PostNotFoundError);
    });
  });

  describe("deletePost", () => {
    it("success: 글 및 attachment 삭제", async () => {
      // Given: 글이 존재하며 owner가 일치하는 경우
      const user = await saveTestUser(userRepository);
      const post = await saveTestPost(postRepository, user.id);
      const attachment = await saveTestAttachment(attachmentRepository, {
        post,
      });
      fakeS3.put(attachment.s3Key);

      // When: 글 삭제 시도
      await postMutationService.deletePost(user.id, post.id);

      // Then: 글 및 attachments 삭제됨
      expect(await postRepository.findOneBy({ id: post.id })).toBeNull();
      expect(
        await attachmentRepository.findOneBy({ id: attachment.id }),
      ).toBeNull();
      expect(await fakeS3.exists(attachment.s3Key)).toBe(false);
    });

    it("존재하지 않는 글 처리", async () => {
      // Given: 글이 존재하지 않는 경우
      const user = await saveTestUser(userRepository);

      // When: 글 삭제 시도
      const result = postMutationService.deletePost(user.id, 0);

      // Then: throws handled error
      await expect(result).rejects.toThrow(PostNotFoundError);
    });

    it("글 owner가 아닌 경우 처리", async () => {
      // Given: 글이 존재하지만, owner가 일치하지 않는 경우
      const user = await saveTestUser(userRepository);
      const otherUser = await saveTestUser(userRepository);
      const post = await saveTestPost(postRepository, otherUser.id);

      // When: 글 삭제 시도
      const result = postMutationService.deletePost(user.id, post.id);

      // Then: throws handled error
      await expect(result).rejects.toThrow(NotPostAuthorError);
    });
  });
});
