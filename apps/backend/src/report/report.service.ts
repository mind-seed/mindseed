import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Report } from "./entities/report.entity";
import { PostQueryService } from "src/post/post-query.service";
import { PostNotFoundError } from "src/post/post.errors";

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly postQueryService: PostQueryService,
  ) {}

  /**
   * 신고를 생성한다.
   * @param userId 신고한 사용자 id
   * @param postId 신고 대상 게시글 id
   * @param reason 신고 사유
   * @returns 생성된 신고
   */
  async createReport(
    userId: number,
    postId: number,
    reason: string,
  ): Promise<Report> {
    // postId에 대응하는 글이 존재하는지 확인
    const postExists = await this.postQueryService.existsPost(postId);
    if (!postExists) {
      throw new PostNotFoundError();
    }

    const report = this.reportRepository.create({
      reason,
      post: { id: postId },
      user: { id: userId },
    });
    return this.reportRepository.save(report);
  }
}
