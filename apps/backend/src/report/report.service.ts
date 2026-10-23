import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Report } from "./entities/report.entity";
import { PostQueryService } from "src/post/post-query.service";
import { PostNotFoundError } from "src/post/post.errors";
import { CommentNotFoundError } from "src/comment/comment.errors";
import { ReportNotFoundError, ReportReasonEmptyError } from "./report.errors";
import { ReportRange } from "./entities/report.entity";
import { CommentService } from "src/comment/comment.service";
import { PostMutationService } from "src/post/post-mutation.service";
import { User } from "src/user/entities/user.entity";
import { ReportType } from "@mindseed/api-types";

export type getReportResult = {
  report: Report[];
  totalCount: number;
};

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly postQueryService: PostQueryService,
    private readonly commentService: CommentService,
    private readonly postMutationService: PostMutationService,
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
      postId: postId,
      userId: userId,
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
      commentId,
      userId,
    });
    return this.reportRepository.save(report);
  }

  /**
   * 신고 내역을 조회한다.
   * @param page 페이지 번호
   * @param limit 페이지당 항목 수
   * @param orderDirection 정렬 기준
   * @returns 신고 내역
   */
  async getReports(
    page: number,
    limit: number,
    orderDirection: "ASC" | "DESC",
  ): Promise<getReportResult> {
    const reports = await this.reportRepository
      .createQueryBuilder("report")
      .where("report.isProcessed = :isProcessed", {
        isProcessed: false,
      })
      .leftJoinAndSelect("report.user", "user")
      .leftJoinAndSelect("user.profile", "profile")
      .leftJoinAndSelect("report.post", "post")
      .leftJoinAndSelect("report.comment", "comment")
      .orderBy("report.createdAt", orderDirection)
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalCount = await this.reportRepository.count({
      where: { isProcessed: false },
    });

    return {
      report: reports,
      totalCount,
    };
  }

  /**
   * 신고 내역을 조회한다.
   * @param id 신고 id
   * @param type 신고 처리 방법
   * @param user 신고 처리자
   * @returns void
   */

  async patchReport({
    id,
    type,
    user,
  }: {
    id: number;
    type: ReportType;
    user: User;
  }): Promise<void> {
    const userId = user.id;

    const report = await this.reportRepository.findOne({
      where: { id },
      relations: { post: true, comment: true },
    });

    if (!report) {
      throw new ReportNotFoundError();
    }

    if (type === "DELETE") {
      if (report.range === ReportRange.POST) {
        await this.postMutationService.deleteAdminPost(report.postId!);
      } else if (report.range === ReportRange.COMMENT) {
        await this.commentService.adminDeleteComment(
          report.comment!.postId,
          report.commentId!,
          userId,
        );
      }
    }

    await this.reportRepository.update(
      { id },
      {
        isProcessed: true,
        processedAt: new Date(),
        processedBy: user,
        processedById: userId,
      },
    );
  }
}
