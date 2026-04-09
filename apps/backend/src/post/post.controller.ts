import type {
  CreatePostRequestDto,
  CreatePostSuccessResponseDto,
  DeletePostSuccessResponseDto,
  GetPostSuccessResponseDto,
  ListPostsQueryDto,
  ListPostsSuccessResponseDto,
  SetPostLikeRequestDto,
  SetPostLikeSuccessResponseDto,
  UpdatePostRequestDto,
  UpdatePostSuccessResponseDto,
} from "@mindseed/api-types";
import {
  CreatePostRequestDtoSchema,
  CreatePostResponseDtoSchema,
  DeletePostResponseDtoSchema,
  GetPostResponseDtoSchema,
  idParamSchema,
  ListPostsQueryDtoSchema,
  ListPostsResponseDtoSchema,
  PostCategorySchema,
  SetPostLikeRequestDtoSchema,
  SetPostLikeResponseDtoSchema,
  UpdatePostRequestDtoSchema,
  UpdatePostResponseDtoSchema,
} from "@mindseed/api-types";
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
} from "@nestjs/common";
import { CurrentUser, UserOnly } from "src/auth/decorators/auth.decorators";
import { ZodEncodeResponse } from "src/common/interceptors/zod-encode-response.decorator";
import {
  ZodBody,
  ZodParam,
  ZodQuery,
} from "src/common/pipes/zod-validation.decorator";
import { User } from "src/user/entities/user.entity";
import z from "zod";
import { PostCategory } from "./entities/post.entity";
import { PostMutationService } from "./post-mutation.service";
import { PostQueryService } from "./post-query.service";

type ApiPostCategory = z.output<typeof PostCategorySchema>;

const apiToEntityCategory: Record<ApiPostCategory, PostCategory> = {
  dummy1: PostCategory.DUMMY1,
  dummy2: PostCategory.DUMMY2,
  dummy3: PostCategory.DUMMY3,
};

const entityToApiCategory: Record<PostCategory, ApiPostCategory> = {
  [PostCategory.DUMMY1]: "dummy1",
  [PostCategory.DUMMY2]: "dummy2",
  [PostCategory.DUMMY3]: "dummy3",
};

@Controller("/posts")
export class PostController {
  constructor(
    private readonly postQueryService: PostQueryService,
    private readonly postMutationService: PostMutationService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UserOnly()
  @ZodEncodeResponse(CreatePostResponseDtoSchema)
  async createPost(
    @CurrentUser() user: User,
    @ZodBody(CreatePostRequestDtoSchema) body: CreatePostRequestDto,
  ): Promise<CreatePostSuccessResponseDto> {
    const post = await this.postMutationService.createPost({
      userId: user.id,
      content: body.content,
      category: apiToEntityCategory[body.category],
      nickname: body.nickname,
      attachmentIds: body.attachmentIds,
    });
    return { success: true, data: { id: post.id } };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UserOnly()
  @ZodEncodeResponse(ListPostsResponseDtoSchema)
  async listPosts(
    @CurrentUser() user: User,
    @ZodQuery(ListPostsQueryDtoSchema) query: ListPostsQueryDto,
  ): Promise<ListPostsSuccessResponseDto> {
    const {
      items: entries,
      nextCursor,
      attachmentToUrl,
    } = await this.postQueryService.listPosts(user.id, {
      cursor: query.cursor,
      limit: query.limit,
      category: query.category
        ? apiToEntityCategory[query.category]
        : undefined,
      orderBy: query.orderBy,
      orderDirection: query.orderDirection,
    });

    return {
      success: true,
      data: {
        items: entries.map(({ post, withUser }) => ({
          id: post.id,
          content: post.content,
          category: entityToApiCategory[post.category],
          author: { nickname: post.nickname },
          attachments: post.attachments.map((a) => ({
            id: a.id,
            url: attachmentToUrl[a.id],
          })),
          likeCount: post.likeCount,
          isOwner: withUser.isOwner,
          isLiked: withUser.isLiked,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        })),
        nextCursor: nextCursor ?? null,
      },
    };
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @UserOnly()
  @ZodEncodeResponse(GetPostResponseDtoSchema)
  async getPost(
    @CurrentUser() user: User,
    @ZodParam("id", idParamSchema) id: number,
  ): Promise<GetPostSuccessResponseDto> {
    const { entry, attachmentToUrl } = await this.postQueryService.getPost(
      user.id,
      id,
    );
    return {
      success: true,
      data: {
        id: entry.post.id,
        content: entry.post.content,
        category: entityToApiCategory[entry.post.category],
        author: { nickname: entry.post.nickname },
        attachments: entry.post.attachments.map((a) => ({
          id: a.id,
          url: attachmentToUrl[a.id],
        })),
        comments: entry.post.comments.map((c) => ({
          id: c.id,
          content: c.content,
          author: {
            nickname: c.nickname,
          },
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })),
        likeCount: entry.post.likeCount,
        isOwner: entry.withUser.isOwner,
        isLiked: entry.withUser.isLiked,
        createdAt: entry.post.createdAt,
        updatedAt: entry.post.updatedAt,
      },
    };
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @UserOnly()
  @ZodEncodeResponse(UpdatePostResponseDtoSchema)
  async updatePost(
    @CurrentUser() user: User,
    @ZodParam("id", idParamSchema) id: number,
    @ZodBody(UpdatePostRequestDtoSchema) body: UpdatePostRequestDto,
  ): Promise<UpdatePostSuccessResponseDto> {
    await this.postMutationService.updatePost({
      userId: user.id,
      postId: id,
      content: body.content,
      category: apiToEntityCategory[body.category],
      attachmentIds: body.attachmentIds,
    });
    return { success: true, data: null };
  }

  @Put(":id/like")
  @HttpCode(HttpStatus.OK)
  @UserOnly()
  @ZodEncodeResponse(SetPostLikeResponseDtoSchema)
  async setPostLike(
    @CurrentUser() user: User,
    @ZodParam("id", idParamSchema) id: number,
    @ZodBody(SetPostLikeRequestDtoSchema) body: SetPostLikeRequestDto,
  ): Promise<SetPostLikeSuccessResponseDto> {
    await this.postMutationService.setPostLike(user.id, id, body.liked);
    return { success: true, data: null };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @UserOnly()
  @ZodEncodeResponse(DeletePostResponseDtoSchema)
  async deletePost(
    @CurrentUser() user: User,
    @ZodParam("id", idParamSchema) id: number,
  ): Promise<DeletePostSuccessResponseDto> {
    await this.postMutationService.deletePost(user.id, id);
    return { success: true, data: null };
  }
}
