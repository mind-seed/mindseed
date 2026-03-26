import { Inject, Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, IsNull, Repository } from "typeorm";
import type { ConfigType } from "@nestjs/config";
import { DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import { Post, PostCategory } from "./post.entity";
import { PostLike } from "./post-like.entity";
import { Attachment } from "../attachment/attachment.entity";
import { S3_CLIENT } from "src/s3-storage/s3-storage.module";
import { s3Config } from "src/config";
import {
  AttachmentAlreadyAssociatedError,
  AttachmentNotFoundError,
  InvalidCursorError,
  NotPostAuthorError,
  PostNotFoundError,
} from "./post.errors";
import { createAttachmentS3Key } from "src/attachment/attachment-s3-key.helper";

export type CreatePostOptions = {
  userId: number;
  content: string;
  nickname: string;
  category: PostCategory;
  attachmentIds: number[];
};

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

export type UpdatePostOptions = {
  userId: number;
  postId: number;
  content: string;
  category: PostCategory;
  attachmentIds: number[];
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
 * PostController와 1:1로 대응되는, post 관련 orchestration logic을 담당한다.
 */
@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(S3_CLIENT) private readonly s3Client: S3Client,
    @Inject(s3Config.KEY)
    private readonly s3cfg: ConfigType<typeof s3Config>,
  ) {}

  /*
   * options를 기반으로 새 글을 생성한다.
   * @returns 생성된 글
   */
  async createPost({
    userId,
    content,
    nickname,
    category,
    attachmentIds,
  }: CreatePostOptions): Promise<Post> {
    await this.ensureAttachmentValidityForPostAssociation(attachmentIds);

    const post = await this.postRepository.save(
      this.postRepository.create({
        author: { id: userId },
        content,
        nickname,
        category,
        attachments: attachmentIds.map((id) => ({ id })),
      }),
    );

    return post;
  }

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

  /**
   * userId에 대응하는 사용자가 글의 작성자인 경우 글을 업데이트한다.
   */
  async updatePost({
    userId,
    postId,
    content,
    category,
    attachmentIds,
  }: UpdatePostOptions): Promise<void> {
    await this.ensureAttachmentValidityForPostAssociation(attachmentIds);

    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: { author: true, attachments: true },
    });

    if (!post) {
      throw new PostNotFoundError();
    }

    if (post.author.id !== userId) {
      throw new NotPostAuthorError();
    }

    const oldAttachmentIdSet = new Set(post.attachments.map((x) => x.id));
    const attachmentIdSet = new Set(attachmentIds);

    const deletingAttachments = post.attachments.filter(
      (attachment) => !attachmentIdSet.has(attachment.id),
    );
    const newAttachmentIds = [
      ...attachmentIdSet.difference(oldAttachmentIdSet),
    ];

    await this.dataSource.transaction(async (manager) => {
      const postRepository = manager.getRepository(Post);
      const attachmentRepository = manager.getRepository(Attachment);

      await postRepository.update({ id: postId }, { content, category });
      await attachmentRepository.update(
        { id: In(newAttachmentIds) },
        { post: { id: postId } },
      );
      await attachmentRepository.delete({
        id: In(deletingAttachments.map(({ id }) => id)),
      });
    });

    await this.deleteAttachmentsInS3(post.attachments);
  }

  /**
   * userId에 대한 사용자의 글 좋아요 표시 유무를 업데이트한다.
   */
  async setPostLike(
    userId: number,
    postId: number,
    liked: boolean,
  ): Promise<void> {
    const existingPost = await this.postRepository.findOneBy({
      id: postId,
    });

    if (!existingPost) {
      throw new PostNotFoundError();
    }

    const postLikeExists = await this.postLikeRepository.existsBy({
      user: { id: userId },
      post: { id: postId },
    });

    await this.dataSource.transaction(async (manager) => {
      const postLikeRepository = manager.getRepository(PostLike);
      const postRepository = manager.getRepository(Post);

      if (liked && !postLikeExists) {
        existingPost.likeCount++;
        await postRepository.save(existingPost);

        await postLikeRepository.save(
          this.postLikeRepository.create({
            user: { id: userId },
            post: { id: postId },
          }),
        );
      }

      if (!liked && postLikeExists) {
        existingPost.likeCount--;
        await postRepository.save(existingPost);

        await postLikeRepository.delete({
          user: { id: userId },
          post: { id: postId },
        });
      }
    });
  }

  /**
   * userId에 대응하는 사용자가 글의 작성자인 경우, 글을 삭제한다.2
   */
  async deletePost(userId: number, postId: number): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: { author: true, attachments: true },
    });

    if (!post) {
      throw new PostNotFoundError();
    }

    if (post.author.id !== userId) {
      throw new NotPostAuthorError();
    }

    await this.postRepository.delete({
      id: postId,
    });

    await this.deleteAttachmentsInS3(post.attachments);
  }

  /**
   * attachmentIds가 가리키는 attachment가 모두 글과 연관될 수 있는지를
   * 확인한다.
   * 존재하지 않는 경우 / confirmed 되지 않은 경우 / 이미 다른 글과 연관되어 있으면
   * throw 한다.
   */
  private async ensureAttachmentValidityForPostAssociation(
    attachmentIds: number[],
  ): Promise<void> {
    const confirmedAttachmentsCount = await this.attachmentRepository.countBy({
      id: In(attachmentIds),
      confirmed: true,
    });

    if (confirmedAttachmentsCount < attachmentIds.length) {
      throw new AttachmentNotFoundError();
    }

    const validAttachmentsCount = await this.attachmentRepository.countBy({
      id: In(attachmentIds),
      post: IsNull(),
    });

    if (validAttachmentsCount < attachmentIds.length) {
      throw new AttachmentAlreadyAssociatedError();
    }
  }

  /**
   * attachments를 S3 상에서 삭제한다.
   */
  private async deleteAttachmentsInS3(attachments: Attachment[]) {
    await this.s3Client.send(
      new DeleteObjectsCommand({
        Bucket: this.s3cfg.bucket,
        Delete: {
          Objects: attachments.map((attachment) => ({
            Key: createAttachmentS3Key(attachment.s3Key),
          })),
        },
      }),
    );
  }
}
