import { Injectable } from "@nestjs/common";
import { PostComment } from "./entities/post-comment.entity";

export type CreateCommentOptions = {
  postId: number;
  userId: number;
  nickname: string;
  content: string;
};

export type UpdateCommentOptions = {
  commentId: number;
  userId: number;
  content: string;
};

/**
 * CommentService와 1:1로 대응되는, comment 관련 orchestration logic을 담당한다.
 */
@Injectable()
export class CommentService {
  /**
   * options 기반으로 새 댓글을 생성한다.
   * @returns 생성된 댓글
   */
  async createComment(options: CreateCommentOptions): Promise<PostComment> {
    throw new Error("Not implemented");
  }

  /**
   * options.commentId가 가리키는 댓글을 수정한다.
   */
  async updateComment(options: UpdateCommentOptions): Promise<void> {}

  /**
   * options.commentId가 가리키는 댓글을 삭제한다.
   */
  async deleteComment(commentId: number, userId: number): Promise<void> {}
}
