import type {
  AdminDeletePostSuccessResponseDto,
  AdminGetPostSuccessResponseDto,
  AdminListPostsQueryDto,
  AdminListPostsSuccessResponseDto,
} from "@mindseed/api-types";
import {
  AdminDeletePostResponseDtoSchema,
  AdminGetPostResponseDtoSchema,
  AdminListPostsQueryDtoSchema,
  AdminListPostsResponseDtoSchema,
  idParamSchema,
} from "@mindseed/api-types";
import { Controller, Delete, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { AdminOnly } from "src/auth/decorators/auth.decorators";
import { ZodEncodeResponse } from "src/common/interceptors/zod-encode-response.decorator";
import { ZodParam, ZodQuery } from "src/common/pipes/zod-validation.decorator";
import { PostQueryService } from "./post-query.service";
import { entityToApiCategory, entityToApiDeletionType } from "./post.mappers";
import { PostMutationService } from "./post-mutation.service";

@Controller("/admin/posts")
export class PostAdminController {
  constructor(
    private readonly postQueryService: PostQueryService,
    private readonly postMutationService: PostMutationService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @AdminOnly()
  @ZodEncodeResponse(AdminListPostsResponseDtoSchema)
  async listPosts(
    @ZodQuery(AdminListPostsQueryDtoSchema) query: AdminListPostsQueryDto,
  ): Promise<AdminListPostsSuccessResponseDto> {
    const { items: entries, totalCount } =
      await this.postQueryService.adminListPosts({
        page: query.page,
        limit: query.limit,
        orderBy: query.orderBy,
        category: query.category,
        isReported: query.isReported,
        query: query.query,
      });

    return {
      success: true,
      data: {
        posts: entries.map((post) => ({
          id: post.post.id,
          content: post.post.content,
          category: entityToApiCategory[post.post.category],
          author: {
            nickname: post.post.nickname,
          },
          likeCount: post.additional.likeCount,
          reportCount: post.additional.reportCount,
          commentCount: post.additional.commentCount,
          createdAt: post.post.createdAt,
          updatedAt: post.post.updatedAt,
        })),
        totalCount,
      },
    };
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @AdminOnly()
  @ZodEncodeResponse(AdminGetPostResponseDtoSchema)
  async adminGetPost(
    @ZodParam("id", idParamSchema) id: number,
  ): Promise<AdminGetPostSuccessResponseDto> {
    const { post, attachmentToUrl, comments, reports } =
      await this.postQueryService.adminGetPost(id);

    return {
      success: true,
      data: {
        id: post.id,
        content: post.content,
        category: entityToApiCategory[post.category],
        author: { nickname: post.nickname },
        attachments: post.attachments.map((a) => ({
          id: a.id,
          url: attachmentToUrl[a.id],
        })),
        comments: comments.map(({ comment: c, type }) => {
          const common = {
            id: c.id,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
          };

          switch (type) {
            case "deleted":
              return {
                ...common,
                type,
                deletionType: entityToApiDeletionType[c.deletionType!],
              };
            case "authorDeleted":
              return {
                ...common,
                type,
                content: c.content,
              };
            case "active":
              return {
                ...common,
                type,
                content: c.content,
                author: { nickname: c.nickname },
              };
          }
        }),
        reports: reports.map((report) => {
          const user = report.user?.profile
            ? { nickname: report.user.profile.nickname }
            : null;

          return {
            id: report.id,
            reason: report.reason,
            createdAt: report.createdAt,
            postId: report.postId,
            commentId: report.commentId,
            range: report.range,
            user,
          };
        }),
        likeCount: post.likeCount,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @AdminOnly()
  @ZodEncodeResponse(AdminDeletePostResponseDtoSchema)
  async deleteAdminPost(
    @ZodParam("id", idParamSchema) id: number,
  ): Promise<AdminDeletePostSuccessResponseDto> {
    await this.postMutationService.deleteAdminPost(id);
    return { success: true, data: null };
  }
}
