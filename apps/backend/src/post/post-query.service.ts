import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
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

/* shared types */

export type PostWithRelations = {
  post: Post;
  withUser: {
    isOwner: boolean;
    isLiked: boolean;
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

  /**
   * postId에 대응하는 글이 존재하는지 확인한다.
   * @returns 존재하는 경우 true, 존재하지 않는 경우 false
   */
  async existsPost(postId: number): Promise<boolean> {
    return this.postRepository.existsBy({ id: postId });
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
