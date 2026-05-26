import { Test, TestingModule } from "@nestjs/testing";
import { getDataSourceToken, getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import PGMem from "pg-mem";
import { CommentService } from "./comment.service";
import { CommentNotFoundError, NotCommentAuthorError } from "./comment.errors";
import { PostComment, DeletionType } from "./entities/post-comment.entity";
import { Post, PostCategory } from "src/post/entities/post.entity";
import { User, UserRole } from "src/user/entities/user.entity";
import { UserProfile } from "src/user/entities/user-profile.entity";
import { initializePgMem } from "src/test/pg-mem.helper";
import { PostNotFoundError } from "src/post/post.errors";
import { Attachment } from "src/attachment/entities/attachment.entity";
import { Temporal } from "@js-temporal/polyfill";

const entities = [UserProfile, User, Attachment, PostComment, Post];

describe("CommentService", () => {
  let module: TestingModule;
  let commentService: CommentService;
  let commentRepository: Repository<PostComment>;
  let postRepository: Repository<Post>;
  let userRepository: Repository<User>;
  let dataSource: DataSource;
  let dbBackup: PGMem.IBackup;

  let userCounter = 0;

  async function saveTestUser(overrides?: Partial<User>): Promise<User> {
    return userRepository.save(
      userRepository.create({
        email: `user${++userCounter}@test.com`,
        password: "password",
        role: UserRole.USER,
        ...overrides,
      }),
    );
  }

  async function saveTestPost(
    userId: number,
    overrides?: Partial<Post>,
  ): Promise<Post> {
    return postRepository.save(
      postRepository.create({
        content: "test content",
        category: PostCategory.DUMMY1,
        nickname: "testnick",
        author: { id: userId } as User,
        ...overrides,
      }),
    );
  }

  async function saveTestComment(
    postId: number,
    authorId: number,
    overrides?: Partial<PostComment>,
  ): Promise<PostComment> {
    return commentRepository.save(
      commentRepository.create({
        content: "test comment",
        nickname: "testnick",
        post: { id: postId } as Post,
        author: { id: authorId } as User,
        deletedAt: null,
        deletedBy: null,
        deletionType: null,
        ...overrides,
      }),
    );
  }

  beforeAll(async () => {
    const { dataSource: ds, backup } = await initializePgMem(entities);
    dataSource = ds;
    dbBackup = backup;

    module = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(PostComment),
          useValue: dataSource.getRepository(PostComment),
        },
        {
          provide: getRepositoryToken(Post),
          useValue: dataSource.getRepository(Post),
        },
        {
          provide: getDataSourceToken(),
          useValue: dataSource,
        },
      ],
    }).compile();

    commentService = module.get(CommentService);
    commentRepository = dataSource.getRepository(PostComment);
    postRepository = dataSource.getRepository(Post);
    userRepository = dataSource.getRepository(User);
  });

  beforeEach(() => {
    dbBackup.restore();
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  describe("createComment", () => {
    it("success: 댓글 저장", async () => {
      // Given: 글이 존재하는 경우
      const user = await saveTestUser();
      const post = await saveTestPost(user.id);

      // When: 댓글 생성 시도
      const comment = await commentService.createComment({
        postId: post.id,
        userId: user.id,
        content: "hello",
        nickname: "nick",
      });

      // Then: 댓글 저장
      const savedComment = await commentRepository.findOneBy({
        id: comment.id,
      });
      expect(savedComment).not.toBeNull();
    });

    it("존재하지 않는 글 처리", async () => {
      // Given: 글이 존재하지 않는 경우
      const user = await saveTestUser();
      const nonExistentPostId = 0;

      // When: 댓글 생성 시도
      const result = commentService.createComment({
        postId: nonExistentPostId,
        userId: user.id,
        content: "hello",
        nickname: "nick",
      });

      // Then: throws handled error
      await expect(result).rejects.toThrow(PostNotFoundError);
    });

    it("탈퇴한 owner의 글 처리 (soft-deleted)", async () => {
      // Given: 탈퇴한 owner의 글인 경우
      const postOwner = await saveTestUser();
      const post = await saveTestPost(postOwner.id);
      await userRepository.softDelete({ id: postOwner.id });

      // When: 댓글 생성 시도
      const user = await saveTestUser();
      const result = commentService.createComment({
        postId: post.id,
        userId: user.id,
        content: "hello",
        nickname: "nick",
      });

      // Then: throws handled error
      await expect(result).rejects.toThrow(PostNotFoundError);
    });
  });

  describe("updateComment", () => {
    it("success: 댓글 업데이트", async () => {
      // Given: 댓글이 존재하며, 사용자가 댓글의 작성자인 경우
      const user = await saveTestUser();
      const post = await saveTestPost(user.id);
      const comment = await saveTestComment(post.id, user.id);
      const newContent = "new content";

      // When: 댓글 업데이트 시도
      await commentService.updateComment({
        postId: post.id,
        commentId: comment.id,
        userId: user.id,
        content: newContent,
      });

      // Then: 댓글 올바르게 업데이트
      const updatedComment = await commentRepository.findOneBy({
        id: comment.id,
      });
      expect(updatedComment).toMatchObject<Partial<PostComment>>({
        content: newContent,
      });
    });

    it("존재하지 않는 글 처리", async () => {
      // Given: 글이 존재하지 않는 경우
      const user = await saveTestUser();
      const nonExistentPostId = 0;
      const newContent = "new content";

      // When: 댓글 업데이트 시도
      const result = commentService.updateComment({
        postId: nonExistentPostId,
        commentId: 0,
        userId: user.id,
        content: newContent,
      });

      // Then: throws handled error
      await expect(result).rejects.toThrow(PostNotFoundError);
    });

    it("탈퇴한 owner의 글 처리 (soft-deleted)", async () => {
      // Given: 탈퇴한 owner의 글인 경우
      const postOwner = await saveTestUser();
      const post = await saveTestPost(postOwner.id);
      await userRepository.softDelete({ id: postOwner.id });

      // When: 댓글 업데이트 시도
      const user = await saveTestUser();
      const comment = await saveTestComment(post.id, user.id);
      const result = commentService.updateComment({
        postId: post.id,
        commentId: comment.id,
        userId: user.id,
        content: "new content",
      });

      // Then: throws handled error
      await expect(result).rejects.toThrow(PostNotFoundError);
    });

    it("DB에 존재하지 않는 댓글 처리", async () => {
      // Given: 글은 존재하지만 댓글이 존재하지 않는 경우
      const user = await saveTestUser();
      const post = await saveTestPost(user.id);
      const nonExistentCommentId = 0;
      const newContent = "new content";

      // When: 댓글 업데이트 시도
      const result = commentService.updateComment({
        postId: post.id,
        commentId: nonExistentCommentId,
        userId: user.id,
        content: newContent,
      });

      // Then: throws handled error
      await expect(result).rejects.toThrow(CommentNotFoundError);
    });

    it("해당 글의 댓글이 아닌 경우 처리", async () => {
      // Given: 댓글이 존재하지만, 해당 글의 댓글이 아닌 경우
      const user = await saveTestUser();
      const post = await saveTestPost(user.id);
      const otherPost = await saveTestPost(user.id);
      const comment = await saveTestComment(otherPost.id, user.id);
      const newContent = "new content";

      // When: 댓글 업데이트 시도
      const result = commentService.updateComment({
        postId: post.id,
        commentId: comment.id,
        userId: user.id,
        content: newContent,
      });

      // Then: throws handled error
      await expect(result).rejects.toThrow(CommentNotFoundError);
    });

    it("삭제된 댓글 처리", async () => {
      // Given: 댓글이 삭제된 경우
      const user = await saveTestUser();
      const post = await saveTestPost(user.id);
      const comment = await saveTestComment(post.id, user.id, {
        deletedAt: Temporal.Now.instant(),
        deletedBy: user,
        deletionType: DeletionType.AUTHOR,
      });
      const newContent = "new content";

      // When: 댓글 업데이트 시도
      const result = commentService.updateComment({
        postId: post.id,
        commentId: comment.id,
        userId: user.id,
        content: newContent,
      });

      // Then: throws handled error
      await expect(result).rejects.toThrow(CommentNotFoundError);
    });

    it("탈퇴한 댓글 작성자 처리 (soft-deleted)", async () => {
      // Given: 탈퇴한 댓글 작성자인 경우
      const postOwner = await saveTestUser();
      const commentAuthor = await saveTestUser();
      const post = await saveTestPost(postOwner.id);
      const comment = await saveTestComment(post.id, commentAuthor.id);
      await userRepository.softDelete({ id: commentAuthor.id });

      // When: 다른 사용자가 댓글 업데이트 시도
      const otherUser = await saveTestUser();
      const result = commentService.updateComment({
        postId: post.id,
        commentId: comment.id,
        userId: otherUser.id,
        content: "new content",
      });

      // Then: throws handled error
      await expect(result).rejects.toThrow(CommentNotFoundError);
    });

    it("탈퇴한 댓글 작성자 처리 (null authorId)", async () => {
      // Given: hard-deleted 댓글 작성자인 경우 (authorId = null)
      const postOwner = await saveTestUser();
      const commentAuthor = await saveTestUser();
      const post = await saveTestPost(postOwner.id);
      const comment = await saveTestComment(post.id, commentAuthor.id);
      await commentRepository.update({ id: comment.id }, { authorId: null });

      // When: 다른 사용자가 댓글 업데이트 시도
      const otherUser = await saveTestUser();
      const result = commentService.updateComment({
        postId: post.id,
        commentId: comment.id,
        userId: otherUser.id,
        content: "new content",
      });

      // Then: throws handled error
      await expect(result).rejects.toThrow(CommentNotFoundError);
    });

    it("댓글 작성자가 아닌 경우 처리", async () => {
      // Given: 댓글이 존재하지만, 사용자가 댓글 작성자가 아닌 경우
      const user = await saveTestUser();
      const otherUser = await saveTestUser();
      const post = await saveTestPost(user.id);
      const comment = await saveTestComment(post.id, otherUser.id);
      const newContent = "new content";

      // When: 댓글 업데이트 시도
      const result = commentService.updateComment({
        postId: post.id,
        commentId: comment.id,
        userId: user.id,
        content: newContent,
      });

      // Then: throws handled error
      await expect(result).rejects.toThrow(NotCommentAuthorError);
    });
  });

  describe("deleteComment", () => {
    it("success: 댓글 삭제 column 업데이트", async () => {
      // Given: 댓글이 존재하며, 사용자가 댓글 작성자인 경우
      const user = await saveTestUser();
      const post = await saveTestPost(user.id);
      const comment = await saveTestComment(post.id, user.id);

      // When: 댓글 삭제 시도
      await commentService.deleteComment(post.id, comment.id, user.id);

      // Then: 댓글 삭제 column 업데이트
      const deletedComment = await commentRepository.findOne({
        where: { id: comment.id },
        relations: ["deletedBy"],
      });
      expect(deletedComment).not.toBeNull();
      expect(deletedComment!.deletedAt).not.toBeNull();
      expect(deletedComment!.deletedBy?.id).toBe(user.id);
      expect(deletedComment!.deletionType).toBe(DeletionType.AUTHOR);
    });

    it("존재하지 않는 글 처리", async () => {
      // Given: 글이 존재하지 않는 경우
      const user = await saveTestUser();
      const nonExistentPostId = 0;

      // When: 댓글 삭제 시도
      const result = commentService.deleteComment(
        nonExistentPostId,
        0,
        user.id,
      );

      // Then: throws handled error
      await expect(result).rejects.toThrow(PostNotFoundError);
    });

    it("탈퇴한 owner의 글 처리 (soft-deleted)", async () => {
      // Given: 탈퇴한 owner의 글인 경우
      const postOwner = await saveTestUser();
      const post = await saveTestPost(postOwner.id);
      await userRepository.softDelete({ id: postOwner.id });

      // When: 다른 사용자가 댓글 삭제 시도
      const otherUser = await saveTestUser();
      const comment = await saveTestComment(post.id, otherUser.id);
      const result = commentService.deleteComment(
        post.id,
        comment.id,
        otherUser.id,
      );

      // Then: throws handled error
      await expect(result).rejects.toThrow(PostNotFoundError);
    });

    it("DB에 존재하지 않는 댓글 처리", async () => {
      // Given: 글은 존재하지만 댓글이 존재하지 않는 경우
      const user = await saveTestUser();
      const post = await saveTestPost(user.id);
      const nonExistentCommentId = 0;

      // When: 댓글 삭제 시도
      const result = commentService.deleteComment(
        post.id,
        nonExistentCommentId,
        user.id,
      );

      // Then: throws handled error
      await expect(result).rejects.toThrow(CommentNotFoundError);
    });

    it("해당 글의 댓글이 아닌 경우 처리", async () => {
      // Given: 댓글이 존재하지만, 해당 글의 댓글이 아닌 경우
      const user = await saveTestUser();
      const post = await saveTestPost(user.id);
      const otherPost = await saveTestPost(user.id);
      const comment = await saveTestComment(otherPost.id, user.id);

      // When: 댓글 삭제 시도
      const result = commentService.deleteComment(post.id, comment.id, user.id);

      // Then: throws handled error
      await expect(result).rejects.toThrow(CommentNotFoundError);
    });

    it("삭제된 댓글 처리", async () => {
      // Given: 댓글이 삭제된 경우
      const user = await saveTestUser();
      const post = await saveTestPost(user.id);
      const comment = await saveTestComment(post.id, user.id, {
        deletedAt: Temporal.Now.instant(),
        deletedBy: user,
        deletionType: DeletionType.AUTHOR,
      });

      // When: 댓글 삭제 시도
      const result = commentService.deleteComment(post.id, comment.id, user.id);

      // Then: throws handled error
      await expect(result).rejects.toThrow(CommentNotFoundError);
    });

    it("탈퇴한 댓글 작성자 처리 (soft-deleted)", async () => {
      // Given: 탈퇴한 댓글 작성자인 경우
      const postOwner = await saveTestUser();
      const commentAuthor = await saveTestUser();
      const post = await saveTestPost(postOwner.id);
      const comment = await saveTestComment(post.id, commentAuthor.id);
      await userRepository.softDelete({ id: commentAuthor.id });

      // When: 다른 사용자가 댓글 삭제 시도
      const otherUser = await saveTestUser();
      const result = commentService.deleteComment(
        post.id,
        comment.id,
        otherUser.id,
      );

      // Then: throws handled error
      await expect(result).rejects.toThrow(CommentNotFoundError);
    });

    it("탈퇴한 댓글 작성자 처리 (null authorId)", async () => {
      // Given: hard-deleted 댓글 작성자인 경우 (authorId = null)
      const postOwner = await saveTestUser();
      const commentAuthor = await saveTestUser();
      const post = await saveTestPost(postOwner.id);
      const comment = await saveTestComment(post.id, commentAuthor.id);
      await commentRepository.update({ id: comment.id }, { authorId: null });

      // When: 다른 사용자가 댓글 삭제 시도
      const otherUser = await saveTestUser();
      const result = commentService.deleteComment(
        post.id,
        comment.id,
        otherUser.id,
      );

      // Then: throws handled error
      await expect(result).rejects.toThrow(CommentNotFoundError);
    });

    it("댓글 작성자가 아닌 경우 처리", async () => {
      // Given: 댓글이 존재하지만, 사용자가 댓글 작성자가 아닌 경우
      const user = await saveTestUser();
      const otherUser = await saveTestUser();
      const post = await saveTestPost(user.id);
      const comment = await saveTestComment(post.id, otherUser.id);

      // When: 댓글 삭제 시도
      const result = commentService.deleteComment(post.id, comment.id, user.id);

      // Then: throws handled error
      await expect(result).rejects.toThrow(NotCommentAuthorError);
    });
  });
});
