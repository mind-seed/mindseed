import { Test, TestingModule } from "@nestjs/testing";
import { getDataSourceToken, getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import PGMem from "pg-mem";
import { randomUUID } from "crypto";
import { PostService } from "./post.service";
import {
  AttachmentAlreadyAssociatedError,
  AttachmentNotFoundError,
  NotPostAuthorError,
  PostNotFoundError,
  InvalidCursorError,
} from "./post.errors";
import { Post, PostCategory } from "./post.entity";
import { PostLike } from "./post-like.entity";
import { Attachment } from "../attachment/attachment.entity";
import { User, UserRole } from "../user/user.entity";
import { UserProfile } from "../user/user-profile.entity";
import { S3_CLIENT } from "src/s3-storage/s3-storage.module";
import { s3Config } from "src/config";
import { initializePgMem } from "src/test/pg-mem.helper";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";

const entities = [UserProfile, User, Post, PostLike, Attachment];

const mockS3Config = {
  region: "us-east-1",
  accessKeyId: "test-key",
  secretAccessKey: "test-secret",
  bucket: "test-bucket",
};

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

describe("PostService", () => {
  let module: TestingModule;
  let postService: PostService;
  let postRepository: Repository<Post>;
  let postLikeRepository: Repository<PostLike>;
  let attachmentRepository: Repository<Attachment>;
  let userRepository: Repository<User>;
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
        PostService,
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
        { provide: S3_CLIENT, useValue: mockS3Client },
        { provide: s3Config.KEY, useValue: mockS3Config },
      ],
    }).compile();

    postService = module.get(PostService);
    postRepository = dataSource.getRepository(Post);
    postLikeRepository = dataSource.getRepository(PostLike);
    attachmentRepository = dataSource.getRepository(Attachment);
    userRepository = dataSource.getRepository(User);
  });

  beforeEach(() => {
    dbBackup.restore();
    mockS3Client.send.mockReset();
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
      const post = await postService.createPost({
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
      const result = postService.createPost({
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
      const result = postService.createPost({
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
      const result = postService.createPost({
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

  describe("listPosts", () => {
    // 2026-03-23: success 처리를 parameter의 조합별로 더 테스트하는 것이 더
    // 엄밀하지만, 현재는 그럴 필요가 없다고 판단하여 success 케이스 하나만
    // 처리합니다.
    it("success: 각 parameter 처리", async () => {
      // Given: posts
      const user = await saveTestUser(userRepository);
      const p1 = await saveTestPost(postRepository, user.id, {
        category: PostCategory.DUMMY1,
      });
      const p2 = await saveTestPost(postRepository, user.id, {
        category: PostCategory.DUMMY1,
      });
      const p3 = await saveTestPost(postRepository, user.id, {
        category: PostCategory.DUMMY1,
      });
      await saveTestPost(postRepository, user.id, {
        category: PostCategory.DUMMY2,
      });

      // When: 글 조회 시도
      const result = await postService.listPosts({
        limit: 2,
        category: PostCategory.DUMMY1,
        orderBy: "createdAt",
        orderDirection: "asc",
      });

      // Then: 올바른 결과 반환
      expect(result.posts.map((p) => p.id)).toEqual([p1.id, p2.id]);
      expect(result.nextCursor).toBeDefined();

      // When: nextCursor로 글 조회 시도
      const result2 = await postService.listPosts({
        cursor: result.nextCursor,
        limit: 2,
        category: PostCategory.DUMMY1,
        orderBy: "createdAt",
        orderDirection: "asc",
      });

      // Then: 올바른 결과 반환
      expect(result2.posts.map((p) => p.id)).toEqual([p3.id]);
      expect(result2.nextCursor).toBeUndefined();
    });

    it("success: cursor에 해당하는 글이 삭제된 경우 올바르게 처리", async () => {
      // Given: cursor에 해당하는 글이 삭제된 경우
      const user = await saveTestUser(userRepository);
      const p1 = await saveTestPost(postRepository, user.id);
      const p2 = await saveTestPost(postRepository, user.id);
      const p3 = await saveTestPost(postRepository, user.id);

      const firstPage = await postService.listPosts({
        limit: 1,
        orderBy: "createdAt",
        orderDirection: "asc",
      });
      await postRepository.delete(p1.id);

      // When: 글 조회 시도
      const result = await postService.listPosts({
        cursor: firstPage.nextCursor,
        limit: 2,
        orderBy: "createdAt",
        orderDirection: "asc",
      });

      // Then: 삭제된 글 다음부터 올바르게 반환
      expect(result.posts.map((p) => p.id)).toEqual([p2.id, p3.id]);
    });

    it("category 및 orderBy와 벗어난 cursor 처리", async () => {
      // Given: cursor가 category 및 orderBy를 다르게 하여 조회했을 때의
      // 결과물인 경우
      const user = await saveTestUser(userRepository);
      await saveTestPost(postRepository, user.id, {
        category: PostCategory.DUMMY1,
      });
      await saveTestPost(postRepository, user.id, {
        category: PostCategory.DUMMY1,
      });
      const firstPage = await postService.listPosts({
        limit: 1,
        orderBy: "createdAt",
        orderDirection: "asc",
        category: PostCategory.DUMMY1,
      });

      // When: 글 조회 시도
      const result = postService.listPosts({
        cursor: firstPage.nextCursor,
        limit: 1,
        orderBy: "createdAt",
        orderDirection: "asc",
        category: PostCategory.DUMMY2,
      });

      // Then: throws handled error
      await expect(result).rejects.toThrow(InvalidCursorError);
    });
  });

  describe("getPost", () => {
    it("success: 올바른 글 반환", async () => {
      // Given: 글이 존재하는 경우
      const user = await saveTestUser(userRepository);
      const post = await postRepository.save(
        postRepository.create({
          content: "hello world",
          category: PostCategory.DUMMY1,
          nickname: "testnick",
          author: user,
        }),
      );

      // When: 글 조회 시도
      const result = await postService.getPost(post.id);

      // Then: 올바른 글 반환
      expect(result).toMatchObject({
        id: post.id,
        content: "hello world",
        category: PostCategory.DUMMY1,
      });
    });

    it("존재하지 않는 글 처리", async () => {
      // Given: 글이 존재하지 않는 경우

      // When: 글 조회 시도
      const result = postService.getPost(0);

      // Then: throws handled error
      await expect(result).rejects.toThrow(PostNotFoundError);
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

      // Given: new attachments가 confirmed이며 associated 되지 않은 경우
      const newAttachment = await saveTestAttachment(attachmentRepository);
      // assumption: send() 호출 시 해당 반환값은 사용되지 않음
      mockS3Client.send.mockResolvedValue({});

      // When: 글 업데이트 시도
      await postService.updatePost({
        userId: user.id,
        postId: post.id,
        content: "updated content",
        category: PostCategory.DUMMY2,
        attachmentIds: [newAttachment.id],
      });

      // Then: 글 및 new attachments 업데이트됨, old attachments 삭제
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
      expect(
        await attachmentRepository.findOneBy({ id: oldAttachment.id }),
      ).toBeNull();
      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(DeleteObjectsCommand),
      );
    });

    it("존재하지 않는 글 처리", async () => {
      // Given: 글이 존재하지 않는 경우

      // When: 글 업데이트 시도
      const result = postService.updatePost({
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
      const result = postService.updatePost({
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
      const result = postService.updatePost({
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
      const result = postService.updatePost({
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
      const result = postService.updatePost({
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
      await postService.setPostLike(user.id, post.id, true);

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
      await postService.setPostLike(user.id, post.id, true);

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
      await postService.setPostLike(user.id, post.id, false);

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
      await postService.setPostLike(user.id, post.id, false);

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
      const result = postService.setPostLike(user.id, 0, true);

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
      mockS3Client.send.mockResolvedValue({});

      // When: 글 삭제 시도
      await postService.deletePost(user.id, post.id);

      // Then: 글 및 attachments 삭제됨
      expect(await postRepository.findOneBy({ id: post.id })).toBeNull();
      expect(
        await attachmentRepository.findOneBy({ id: attachment.id }),
      ).toBeNull();
      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.any(DeleteObjectsCommand),
      );
    });

    it("존재하지 않는 글 처리", async () => {
      // Given: 글이 존재하지 않는 경우
      const user = await saveTestUser(userRepository);

      // When: 글 삭제 시도
      const result = postService.deletePost(user.id, 0);

      // Then: throws handled error
      await expect(result).rejects.toThrow(PostNotFoundError);
    });

    it("글 owner가 아닌 경우 처리", async () => {
      // Given: 글이 존재하지만, owner가 일치하지 않는 경우
      const user = await saveTestUser(userRepository);
      const otherUser = await saveTestUser(userRepository);
      const post = await saveTestPost(postRepository, otherUser.id);

      // When: 글 삭제 시도
      const result = postService.deletePost(user.id, post.id);

      // Then: throws handled error
      await expect(result).rejects.toThrow(NotPostAuthorError);
    });
  });
});
