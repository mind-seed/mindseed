import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Post, PostCategory } from "./post.entity";
import { InvalidCursorError, PostNotFoundError } from "./post.errors";

export type ListPostsOrderBy = "createdAt";

export type ListPostsOptions = {
  cursor?: string;
  limit: number;
  category?: PostCategory;
  orderBy: ListPostsOrderBy;
  orderDirection: "asc" | "desc";
};

export type ListPostsResult = {
  posts: Post[];
  nextCursor?: string;
};

type CursorPayload = {
  category: PostCategory | null;
  orderBy: ListPostsOrderBy;
  orderDirection: "asc" | "desc";
  cursorValue: string;
  cursorId: number;
};

function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeCursor(cursor: string): CursorPayload {
  return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
}

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
    column: 'extract(epoch FROM "post"."created_at")::int',
    cast: "extract(epoch FROM :cursorValue)::int",
    getValue: (post) => post.createdAt.toISOString(),
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
  ) {}

  /*
   * pagination option을 적용하여 글 목록을 조회한다.
   * @returns 글 목록, attachment URL, cursor
   */
  async listPosts({
    limit,
    orderBy,
    orderDirection,
    category,
    cursor,
  }: ListPostsOptions): Promise<ListPostsResult> {
    const decodedCursor = cursor && decodeCursor(cursor);

    if (
      decodedCursor &&
      (category != decodedCursor.category || // != for null-undefined checks
        orderBy !== decodedCursor.orderBy ||
        orderDirection !== decodedCursor.orderDirection)
    ) {
      throw new InvalidCursorError();
    }

    const sqlDirection = orderDirection === "asc" ? "ASC" : "DESC";
    const cursorOp = orderDirection === "asc" ? ">" : "<";
    const orderEntry = orderByMap[orderBy];

    const qb = this.postRepository.createQueryBuilder("post");

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
          cursorValue: decodedCursor.cursorValue,
          cursorId: decodedCursor.cursorId,
        },
      );
    }

    const posts = await qb
      .orderBy(orderEntry.path, sqlDirection)
      .addOrderBy("post.id", sqlDirection)
      .limit(limit)
      .getMany();

    const lastPost = posts.at(-1)!;
    return {
      posts,
      nextCursor:
        posts.length === limit
          ? encodeCursor({
              orderBy,
              orderDirection,
              category: category ?? null,
              cursorId: lastPost.id,
              cursorValue: orderEntry.getValue(lastPost),
            })
          : undefined,
    };
  }

  /**
   * postId에 대응하는 글 하나를 조회한다.
   * @returns 해당 글, attachment URL
   */
  async getPost(postId: number): Promise<Post> {
    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) {
      throw new PostNotFoundError();
    }
    return post;
  }
}
