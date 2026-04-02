import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { PostComment, DeletionType } from "./entities/post-comment.entity";
import { Post } from "src/post/entities/post.entity";
import { CommentNotFoundError, NotCommentAuthorError } from "./comment.errors";
import { PostNotFoundError } from "src/post/post.errors";

export type CreateCommentOptions = {
  postId: number;
  userId: number;
  nickname: string;
  content: string;
};

export type UpdateCommentOptions = {
  postId: number;
  commentId: number;
  userId: number;
  content: string;
};

/**
 * CommentService와 1:1로 대응되는, comment 관련 orchestration logic을 담당한다.
 */
@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(PostComment)
    private readonly commentRepository: Repository<PostComment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  /**
   * options 기반으로 새 댓글을 생성한다.
   * @returns 생성된 댓글
   */
  async createComment({
    postId,
    userId,
    nickname,
    content,
  }: CreateCommentOptions): Promise<PostComment> {
    const postExists = await this.postRepository.existsBy({ id: postId });

    if (!postExists) {
      throw new PostNotFoundError();
    }

    return this.commentRepository.save(
      this.commentRepository.create({
        post: { id: postId },
        author: { id: userId },
        nickname,
        content,
        deletedAt: null,
        deletedBy: null,
        deletionType: null,
      }),
    );
  }

  /**
   * options.commentId가 가리키는 댓글을 수정한다.
   */
  async updateComment({
    postId,
    commentId,
    userId,
    content,
  }: UpdateCommentOptions): Promise<void> {
    const postExists = await this.postRepository.existsBy({ id: postId });

    if (!postExists) {
      throw new PostNotFoundError();
    }

    const comment = await this.commentRepository.findOne({
      where: { id: commentId, post: { id: postId }, deletedAt: IsNull() },
    });

    if (!comment) {
      throw new CommentNotFoundError();
    }

    if (comment.authorId !== userId) {
      throw new NotCommentAuthorError();
    }

    await this.commentRepository.update({ id: commentId }, { content });
  }

  /**
   * options.commentId가 가리키는 댓글을 삭제한다.
   */
  async deleteComment(
    postId: number,
    commentId: number,
    userId: number,
  ): Promise<void> {
    const postExists = await this.postRepository.existsBy({ id: postId });

    if (!postExists) {
      throw new PostNotFoundError();
    }

    const comment = await this.commentRepository.findOne({
      where: { id: commentId, post: { id: postId }, deletedAt: IsNull() },
    });

    if (!comment) {
      throw new CommentNotFoundError();
    }

    if (comment.authorId !== userId) {
      throw new NotCommentAuthorError();
    }

    await this.commentRepository.update(
      { id: commentId },
      {
        deletedAt: new Date(),
        deletedBy: { id: userId },
        deletionType: DeletionType.AUTHOR,
      },
    );
  }
}
