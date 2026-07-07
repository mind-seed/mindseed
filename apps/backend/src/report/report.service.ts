import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Report } from "./entities/report.entity";
import { PostQueryService } from "src/post/post-query.service";
import { PostNotFoundError } from "src/post/post.errors";
import { CommentNotFoundError } from "src/comment/comment.errors";
import { ReportReasonEmptyError } from "./report.errors";
import { ReportRange } from "./entities/report.entity";
import { CommentService } from "src/comment/comment.service";

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly postQueryService: PostQueryService,
    private readonly commentService: CommentService,
  ) {}

  /**
   * 게시글 신고를 생성한다.
   * @param userId 신고한 사용자 id
   * @param postId 신고 대상 게시글 id
   * @param reason 신고 사유
   * @returns 생성된 신고
   */
  async createPostReport(
    userId: number,
    postId: number,
    reason: string,
  ): Promise<Report> {
    if (!reason.trim()) {
      throw new ReportReasonEmptyError();
    }

    // postId에 대응하는 글이 존재하는지 확인
    const postExists = await this.postQueryService.existsPost(postId);
    if (!postExists) {
      throw new PostNotFoundError();
    }

    const report = this.reportRepository.create({
      reason,
      range: ReportRange.POST,
      post: { id: postId },
      user: { id: userId },
    });
    return this.reportRepository.save(report);
  }

  /**
   * 댓글 신고를 생성한다.
   * @param userId 신고한 사용자 id
   * @param commentId 신고 대상 댓글 id
   * @param reason 신고 사유
   * @returns 생성된 신고
   */
  async createCommentReport(
    userId: number,
    commentId: number,
    reason: string,
  ): Promise<Report> {
    if (!reason.trim()) {
      throw new ReportReasonEmptyError();
    }

    // commentId에 대응하는 댓글이 존재하는지 확인
    const commentExists = await this.commentService.existsComment(commentId);
    if (!commentExists) {
      throw new CommentNotFoundError();
    }

    const report = this.reportRepository.create({
      reason,
      range: ReportRange.COMMENT,
      comment: { id: commentId },
      user: { id: userId },
    });
    return this.reportRepository.save(report);
  }
}
