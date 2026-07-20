import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, In, Repository } from "typeorm";
import { Post, PostCategory } from "./entities/post.entity";
import { PostLike } from "./entities/post-like.entity";
import { Attachment } from "../attachment/entities/attachment.entity";
import { PostComment } from "src/comment/entities/post-comment.entity";
import { S3StorageService } from "src/s3-storage/s3-storage.service";
import { PostNotFoundError } from "./post.errors";
import {
  CursorPaginationOptions,
  CursorPaginationResult,
} from "src/common/helpers/pagination";
import { executeCursorPagination } from "src/common/helpers/cursor";
import { AdminListPostsQueryDtoSchema } from "@mindseed/api-types";
import { z } from "zod";
import { apiToEntityCategory } from "./post.mappers";
import { Report } from "src/report/entities/report.entity";

/* shared types */

export type PostWithRelations = {
  post: Post;
  withUser: {
    isOwner: boolean;
    isLiked: boolean;
  };
};

export type PostWithAdminRelations = {
  post: Post;
  additional: {
    likeCount: number;
    commentCount: number;
    reportCount: number;
  };
};

export type AttachmentToUrlMap = Record<number, string>;

/* listPosts */

export type ListPostsOrderBy = "createdAt";

export type ListPostsOptions = CursorPaginationOptions<ListPostsOrderBy> & {
  category?: PostCategory;
};

export type ListPostsResult = CursorPaginationResult<PostWithRelations> & {
  attachmentToUrl: AttachmentToUrlMap;
};

export type AdminListPostsOptions = z.output<
  typeof AdminListPostsQueryDtoSchema
>;

export type AdminListPostsResult = {
  items: PostWithAdminRelations[];
  totalCount: number;
};

/* getPost */

export type CommentType = "active" | "deleted" | "authorDeleted";

export type PostCommentWithType = {
  comment: PostComment;
  type: CommentType;
};

export type GetPostResult = PostWithRelations & {
  attachmentToUrl: AttachmentToUrlMap;
  comments: PostCommentWithType[];
};

export type AdminGetPostResult = {
  post: Post;
  attachmentToUrl: AttachmentToUrlMap;
  comments: PostCommentWithType[];
  reports: Report[];
};

const orderByMap = {
  createdAt: {
    sqlPath: "post.createdAt",
    sqlCursorValue: "extract(epoch FROM post.createdAt)::int",
    toCursorValue: (post: Post) =>
      Math.floor(post.createdAt.epochMilliseconds / 1000),
  },
} satisfies Record<ListPostsOrderBy, object>;

/**
 * controller에서 사용하기 위한 글의 조회를 담당한다.
 */
@Injectable()
export class PostQueryService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
    @InjectRepository(PostComment)
    private readonly postCommentRepository: Repository<PostComment>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    private readonly s3StorageService: S3StorageService,
  ) {}

  /*
   * pagination option을 적용하여 글 목록을 조회한다.
   * @returns 해당 글, userId에 대응하는 user와의 관계, attachment들의 url 맵
   */
  async listPosts(
    userId: number,
    { limit, orderBy, orderDirection, category, cursor }: ListPostsOptions,
  ): Promise<ListPostsResult> {
    const qb = this.postRepository
      .createQueryBuilder("post")
      .innerJoinAndSelect("post.author", "author")
      .leftJoinAndSelect("post.attachments", "attachment")
      .leftJoin(
        "report",
        "report",
        '"report"."post_id" = "post"."id" AND "report"."user_id" = :reportingUserId',
        { reportingUserId: userId },
      )
      .andWhere("report.id IS NULL");

    if (category) {
      qb.andWhere("post.category = :category", { category });
    }

    const { items: posts, nextCursor } = await executeCursorPagination(qb, {
      cursor,
      orderByField: orderByMap[orderBy],
      orderDirection,
      limit,
    });

    const postIds = posts.map((p) => p.id);
    const likedPostIds = new Set(
      postIds.length > 0
        ? (
            await this.postLikeRepository.find({
              where: {
                userId,
                post: { id: In(postIds) },
              },
            })
          ).map((l) => l.postId)
        : [],
    );

    const attachments = posts.flatMap((p) => p.attachments);
    const attachmentToUrl = this.buildAttachmentToUrl(attachments);

    return {
      items: posts.map((post) => ({
        post,
        withUser: {
          isOwner: post.authorId === userId,
          isLiked: likedPostIds.has(post.id),
        },
      })),
      nextCursor,
      attachmentToUrl,
    };
  }

  /*
   * pagination을 적용하여 전체 글 목록을 조회한다.
   * @returns 해당 글 리스트, 글 총 개수
   */
  async adminListPosts({
    page,
    limit,
    orderBy,
    category,
    isReported,
    query,
  }: AdminListPostsOptions): Promise<AdminListPostsResult> {
    const qb = this.postRepository
      .createQueryBuilder("post")
      .innerJoin("post.author", "author");

    if (category) {
      const entityCategory = apiToEntityCategory[category];
      if (entityCategory !== undefined) {
        qb.andWhere("post.category = :category", { category: entityCategory });
      }
    }

    if (isReported) {
      qb.andWhere(
        "post.id IN (SELECT reported_post.post_id FROM report reported_post)",
      );
    }

    if (query) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where("post.content ILIKE :query", {
            query: `%${query}%`,
          }).orWhere("post.nickname ILIKE :query", { query: `%${query}%` });
        }),
      );
    }

    const totalCount = await qb.clone().getCount();
    const skip = (page - 1) * limit;

    let posts: Post[];
    if (orderBy === "mostReported") {
      const rows = await qb
        .clone()
        .select("post.id", "id")
        .leftJoin("report", "order_report", "order_report.post_id = post.id")
        .groupBy("post.id")
        .orderBy('COUNT("order_report"."id")', "DESC")
        .addOrderBy("post.id", "DESC")
        .offset(skip)
        .limit(limit)
        .getRawMany<{ id: number }>();
      const orderedIds = rows.map((row) => Number(row.id));
      const postsById = new Map(
        orderedIds.length > 0
          ? (
              await this.postRepository.find({
                where: { id: In(orderedIds) },
              })
            ).map((post) => [post.id, post])
          : [],
      );
      posts = orderedIds
        .map((id) => postsById.get(id))
        .filter((post): post is Post => post !== undefined);
    } else {
      if (orderBy === "latest") {
        qb.orderBy("post.createdAt", "DESC").addOrderBy("post.id", "DESC");
      } else {
        qb.orderBy("post.createdAt", "ASC").addOrderBy("post.id", "ASC");
      }
      posts = await qb.offset(skip).limit(limit).getMany();
    }

    const postIds = posts.map((post) => post.id);

    const [reportCounts, commentCounts] = await Promise.all([
      this.getPostRelatedCounts("report", postIds),
      this.getPostRelatedCounts("post_comment", postIds),
    ]);

    const result = posts.map((post) => ({
      post: post,
      additional: {
        likeCount: post.likeCount,
        commentCount: commentCounts[post.id] ?? 0,
        reportCount: reportCounts[post.id] ?? 0,
      },
    }));

    return {
      items: result,
      totalCount,
    };
  }

  private async getPostRelatedCounts(
    tableName: "report" | "post_comment",
    postIds: number[],
  ): Promise<Record<number, number>> {
    if (postIds.length === 0) {
      return {};
    }

    const rows = await this.postRepository.manager
      .createQueryBuilder()
      .select(`${tableName}.post_id`, "postId")
      .addSelect("COUNT(*)", "count")
      .from(tableName, tableName)
      .where(`${tableName}.post_id IN (:...postIds)`, { postIds })
      .groupBy(`${tableName}.post_id`)
      .getRawMany<{ postId?: number; postid?: number; count: string }>();

    return Object.fromEntries(
      rows.map((row) => [Number(row.postId ?? row.postid), Number(row.count)]),
    );
  }

  /**
   * postId에 대응하는 글이 존재하는지 확인한다.
   * @returns 존재하는 경우 true, 존재하지 않는 경우 false
   */
  async existsPost(postId: number): Promise<boolean> {
    return this.postRepository.existsBy({ id: postId });
  }

  /**
   * postId에 대응하는 글 하나를 조회한다.
   * @returns 해당 글, 카테고리, 내용, 작성 시각, 작성자 (익명), 이미지 빌더, 댓글, 신고 내역
   */
  async adminGetPost(postId: number): Promise<AdminGetPostResult> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: {
        author: true,
        attachments: true,
        // comments: { author: true },
      },
    });

    if (!post || !post.isActive()) {
      throw new PostNotFoundError();
    }

    const attachmentToUrl = this.buildAttachmentToUrl(post.attachments);

    const comments = await this.postCommentRepository
      .createQueryBuilder("post_comment")
      .leftJoinAndSelect("post_comment.author", "author")
      .where("post_comment.postId = :postId", { postId })
      .orderBy("post_comment.createdAt", "ASC")
      .getMany();

    const reports = await this.reportRepository
      .createQueryBuilder("report")
      .leftJoinAndSelect("report.author", "author")
      .where("report.postId = :postId", { postId })
      .orderBy("report.createdAt", "ASC")
      .getMany();

    return {
      post,
      attachmentToUrl,
      comments: comments.map((comment) => ({
        comment,
        type: this.computeCommentType(comment),
      })),
      reports,
    };
  }

  /**
   * postId에 대응하는 글 하나를 조회한다.
   * @returns 해당 글, userId에 대응하는 user와의 관계, attachment들의 url 맵
   */
  async getPost(userId: number, postId: number): Promise<GetPostResult> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: {
        author: true,
        attachments: true,
        // comments: { author: true },
      },
    });

    if (!post || !post.isActive()) {
      throw new PostNotFoundError();
    }

    const isLiked = await this.postLikeRepository.existsBy({
      userId,
      postId,
    });

    const attachmentToUrl = this.buildAttachmentToUrl(post.attachments);

    // 미신고 댓글만 따로 조회
    const comments = await this.postCommentRepository
      .createQueryBuilder("post_comment")
      .leftJoinAndSelect("post_comment.author", "author")
      .leftJoin(
        "report",
        "report",
        `report.comment_id = post_comment.id
        AND report.user_id = :userId`,
        { userId },
      )
      .where("post_comment.postId = :postId", { postId })
      .andWhere("report.id IS NULL")
      .orderBy("post_comment.createdAt", "ASC")
      .getMany();

    return {
      post,
      withUser: {
        isOwner: post.authorId === userId,
        isLiked,
      },
      attachmentToUrl,
      comments: comments.map((comment) => ({
        comment,
        type: this.computeCommentType(comment),
      })),
    };
  }

  private computeCommentType(comment: PostComment): CommentType {
    if (comment.deletedAt) {
      return "deleted";
    }

    if (!comment.author) {
      return "authorDeleted";
    }

    return "active";
  }

  private buildAttachmentToUrl(attachments: Attachment[]): AttachmentToUrlMap {
    return Object.fromEntries(
      attachments.map((a) => [
        a.id,
        this.s3StorageService.getPublicUrl(a.s3Key),
      ]),
    );
  }
}
