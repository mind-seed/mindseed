import { Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, IsNull, Repository } from "typeorm";
import { Post, PostCategory } from "./post.entity";
import { PostLike } from "./post-like.entity";
import { Attachment } from "../attachment/attachment.entity";
import { S3StorageService } from "src/s3-storage/s3-storage.service";
import {
  AttachmentAlreadyAssociatedError,
  AttachmentNotFoundError,
  NotPostAuthorError,
  PostNotFoundError,
} from "./post.errors";

export type CreatePostOptions = {
  userId: number;
  content: string;
  nickname: string;
  category: PostCategory;
  attachmentIds: number[];
};

export type UpdatePostOptions = {
  userId: number;
  postId: number;
  content: string;
  category: PostCategory;
  attachmentIds: number[];
};

/**
 * controller에서 사용하기 위한 글의 mutation을 담당한다.
 */
@Injectable()
export class PostMutationService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly s3StorageService: S3StorageService,
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

    await this.s3StorageService.deleteMany(
      deletingAttachments.map((a) => a.s3Key),
    );
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
   * userId에 대응하는 사용자가 글의 작성자인 경우, 글을 삭제한다.
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

    await this.s3StorageService.deleteMany(
      post.attachments.map((a) => a.s3Key),
    );
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
}
