import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, In, IsNull, Repository } from "typeorm";
import { PostComment, DeletionType } from "./entities/post-comment.entity";
import { Post } from "src/post/entities/post.entity";
import { CommentNotFoundError, NotCommentAuthorError } from "./comment.errors";
import { PostNotFoundError } from "src/post/post.errors";
import { Temporal } from "@js-temporal/polyfill";
import { AdminListCommentsQueryDtoSchema } from "@mindseed/api-types";
import z from "zod";

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

export type AdminListCommentsOptions = z.output<
  typeof AdminListCommentsQueryDtoSchema
>;

export type AdminListCommentsResult = {
  items: {
    comment: PostComment;
    additional: {
      reportCount: number;
    };
  }[];
  totalCount: number;
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

  private async getCommentReportCounts(
    commentIds: number[],
  ): Promise<Record<number, number>> {
    if (commentIds.length === 0) {
      return {};
    }

    const rows = await this.postRepository.manager
      .createQueryBuilder()
      .select("report.comment_id", "commentId")
      .addSelect("COUNT(*)", "count")
      .from("report", "report")
      .where("report.comment_id IN (:...commentIds)", { commentIds })
      .groupBy("report.comment_id")
      .getRawMany<{ commentId?: number; commentid?: number; count: string }>();

    return Object.fromEntries(
      rows.map((row) => [
        Number(row.commentId ?? row.commentid),
        Number(row.count),
      ]),
    );
  }

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
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: { author: true },
    });

    if (!post || !post.isActive()) {
      throw new PostNotFoundError();
    }

    return this.commentRepository.save(
      this.commentRepository.create({
        postId,
        authorId: userId,
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
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: { author: true },
    });

    if (!post || !post.isActive()) {
      throw new PostNotFoundError();
    }

    const comment = await this.commentRepository.findOne({
      where: { id: commentId, postId, deletedAt: IsNull() },
      relations: { author: true },
    });

    if (!comment || !comment.isActive()) {
      throw new CommentNotFoundError();
    }

    if (comment.authorId !== userId) {
      throw new NotCommentAuthorError();
    }

    await this.commentRepository.update({ id: commentId }, { content });
  }

  /**
   * commentId에 대응하는 글이 존재하는지 확인한다.
   * @returns 존재하는 경우 true, 존재하지 않는 경우 false
   */
  async existsComment(commentId: number): Promise<boolean> {
    return this.commentRepository.existsBy({
      id: commentId,
      deletedAt: IsNull(),
    });
  }

  /**
   * options.commentId가 가리키는 댓글을 삭제한다.
   */
  async deleteComment(
    postId: number,
    commentId: number,
    userId: number,
  ): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: { author: true },
    });

    if (!post || !post.isActive()) {
      throw new PostNotFoundError();
    }

    const comment = await this.commentRepository.findOne({
      where: { id: commentId, postId, deletedAt: IsNull() },
      relations: { author: true },
    });

    if (!comment || !comment.isActive()) {
      throw new CommentNotFoundError();
    }

    if (comment.authorId !== userId) {
      throw new NotCommentAuthorError();
    }

    await this.commentRepository.update(
      { id: commentId },
      {
        deletedAt: Temporal.Now.instant(),
        deletedById: userId,
        deletionType: DeletionType.AUTHOR,
      },
    );
  }

  /**
   * options.commentId가 가리키는 댓글을 유저 관계없이 삭제한다.
   */
  async adminDeleteComment(
    postId: number,
    commentId: number,
    userId: number,
  ): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: { author: true },
    });

    if (!post || !post.isActive()) {
      throw new PostNotFoundError();
    }

    const comment = await this.commentRepository.findOne({
      where: { id: commentId, postId, deletedAt: IsNull() },
      relations: { author: true },
    });

    if (!comment || !comment.isActive()) {
      throw new CommentNotFoundError();
    }

    await this.commentRepository.update(
      { id: commentId },
      {
        deletedAt: Temporal.Now.instant(),
        deletedById: userId,
        deletionType: DeletionType.ADMIN,
      },
    );
  }

  async adminListComments({
    page,
    limit,
    orderBy,
    isReported,
    query,
  }: AdminListCommentsOptions): Promise<AdminListCommentsResult> {
    const qb = this.commentRepository
      .createQueryBuilder("comment")
      .innerJoinAndSelect("comment.post", "post")
      .innerJoinAndSelect("comment.author", "author");

    if (isReported) {
      qb.andWhere(`
        comment.id IN (
          SELECT r.comment_id
          FROM report r
          WHERE r.comment_id IS NOT NULL
        )
      `);
    }

    if (query) {
      const escapedQuery = String(query).replace(/[%_\\]/g, "\\$&");
      qb.andWhere(
        new Brackets((qb) => {
          qb.where("comment.content ILIKE :query", {
            query: `%${escapedQuery}%`,
          }).orWhere("comment.nickname ILIKE :query", {
            query: `%${escapedQuery}%`,
          });
        }),
      );
    }

    const totalCount = await qb.clone().getCount();
    const skip = (page - 1) * limit;

    let comments: PostComment[];
    if (orderBy === "mostReported") {
      const rows = await qb
        .clone()
        .select("comment.id", "id")
        .leftJoin(
          "report",
          "order_report",
          "order_report.comment_id = comment.id",
        )
        .groupBy("comment.id")
        .orderBy('COUNT("order_report"."id")', "DESC")
        .addOrderBy("comment.id", "DESC")
        .offset(skip)
        .limit(limit)
        .getRawMany<{ id: number }>();

      const orderedIds = rows.map((row) => Number(row.id));

      const commentsById = new Map(
        orderedIds.length > 0
          ? (
              await this.commentRepository.find({
                where: { id: In(orderedIds) },
                relations: ["post", "author"],
              })
            ).map((comment) => [comment.id, comment])
          : [],
      );

      comments = orderedIds
        .map((id) => commentsById.get(id))
        .filter((comment): comment is PostComment => comment !== undefined);
    } else {
      if (orderBy === "latest") {
        qb.orderBy("comment.createdAt", "DESC").addOrderBy(
          "comment.id",
          "DESC",
        );
      } else {
        qb.orderBy("comment.createdAt", "ASC").addOrderBy("comment.id", "ASC");
      }

      comments = await qb.offset(skip).limit(limit).getMany();
    }

    const commentIds = comments.map((comment) => comment.id);

    const reportCounts = await this.getCommentReportCounts(commentIds);

    const result = comments.map((comment) => ({
      comment: comment,
      additional: {
        reportCount: reportCounts[comment.id] ?? 0,
      },
    }));

    return {
      items: result,
      totalCount,
    };
  }
}
