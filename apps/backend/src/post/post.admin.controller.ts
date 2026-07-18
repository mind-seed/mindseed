import type {
  AdminListPostsQueryDto,
  AdminListPostsSuccessResponseDto,
} from "@mindseed/api-types";
import {
  AdminListPostsQueryDtoSchema,
  AdminListPostsResponseDtoSchema,
} from "@mindseed/api-types";
import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { AdminOnly } from "src/auth/decorators/auth.decorators";
import { ZodEncodeResponse } from "src/common/interceptors/zod-encode-response.decorator";
import { ZodQuery } from "src/common/pipes/zod-validation.decorator";
import { PostQueryService } from "./post-query.service";
import { entityToApiCategory } from "./post.mappers";

@Controller("/admin/posts")
export class PostAdminController {
  constructor(private readonly postQueryService: PostQueryService) {}

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
}
