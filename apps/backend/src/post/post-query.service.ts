import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Post, PostCategory } from "./entities/post.entity";
import { PostLike } from "./entities/post-like.entity";
import { Attachment } from "../attachment/entities/attachment.entity";
import { S3StorageService } from "src/s3-storage/s3-storage.service";
import { PostNotFoundError } from "./post.errors";
import {
  CursorPaginationOptions,
  CursorPaginationResult,
} from "src/common/helpers/pagination";
import { createCursorCodec } from "src/common/helpers/cursor";
import z from "zod";

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

const cursorCodec = createCursorCodec(
  z.object({
    value: z.string(),
    id: z.number(),
  }),
);

/* getPost */

export type GetPostResult = {
  entry: PostWithRelations;
  attachmentToUrl: AttachmentToUrlMap;
};

// 2026-03-25 code smell....
const orderByMap: Record<
  ListPostsOrderBy,
  {
    path: string;
    column: string;
    cast: string;
    getValue: (post: Post) => string;
  }
> = {
  createdAt: {
    path: "post.createdAt",
    column: "extract(epoch FROM post.createdAt)::int",
    cast: "extract(epoch FROM :cursorValue::timestamp)::int",
    getValue: (post) => post.createdAt.toString(),
  },
};

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
    const decodedCursor = cursor && cursorCodec.decode(cursor);

    const sqlDirection = orderDirection === "asc" ? "ASC" : "DESC";
    const cursorOp = orderDirection === "asc" ? ">" : "<";
    const orderEntry = orderByMap[orderBy];

    const qb = this.postRepository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.author", "author")
      .leftJoinAndSelect("post.attachments", "attachment");

    if (category) {
      qb.where("post.category = :category", { category });
    }

    if (decodedCursor) {
      qb.andWhere(
        [
          `(${orderEntry.column}, "post"."id")`,
          cursorOp,
          `(${orderEntry.cast}, :cursorId::int)`,
        ].join(""),
        {
          cursorValue: decodedCursor.value,
          cursorId: decodedCursor.id,
        },
      );
    }

    const posts = await qb
      .orderBy(orderEntry.path, sqlDirection)
      .addOrderBy("post.id", sqlDirection)
      .take(limit + 1)
      .getMany();

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

    const resultPosts = posts.slice(0, limit);
    const lastPost = resultPosts.at(-1);
    return {
      items: resultPosts.map((post) => ({
        post,
        withUser: {
          isOwner: post.authorId === userId,
          isLiked: likedPostIds.has(post.id),
        },
      })),
      nextCursor:
        posts.length > limit && lastPost
          ? cursorCodec.encode({
              id: lastPost.id,
              value: orderEntry.getValue(lastPost),
            })
          : undefined,
      attachmentToUrl,
    };
  }

  /**
   * postId에 대응하는 글 하나를 조회한다.
   * @returns 해당 글, userId에 대응하는 user와의 관계, attachment들의 url 맵
   */
  async getPost(userId: number, postId: number): Promise<GetPostResult> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: { author: true, attachments: true, comments: true },
    });
    if (!post) {
      throw new PostNotFoundError();
    }

    const isLiked = await this.postLikeRepository.existsBy({
      userId,
      postId,
    });

    const attachmentToUrl = this.buildAttachmentToUrl(post.attachments);

    return {
      entry: {
        post,
        withUser: {
          isOwner: post.authorId === userId,
          isLiked,
        },
      },
      attachmentToUrl,
    };
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
