import { Controller, Delete, Get, HttpCode, HttpStatus } from "@nestjs/common";
import type {
  AdminDeleteCommentSuccessResponseDto,
  AdminListCommentsQueryDto,
  AdminListCommentsSuccessResponseDto,
} from "@mindseed/api-types";
import {
  AdminDeleteCommentResponseDtoSchema,
  AdminListCommentsQueryDtoSchema,
  AdminListCommentsResponseDtoSchema,
  idParamSchema,
} from "@mindseed/api-types";
import { CommentService } from "./comment.service";
import { ZodParam, ZodQuery } from "src/common/pipes/zod-validation.decorator";
import { ZodEncodeResponse } from "src/common/interceptors/zod-encode-response.decorator";
import { AdminOnly, CurrentUser } from "src/auth/decorators/auth.decorators";
import { User } from "src/user/entities/user.entity";

@Controller("/admin/comments")
export class CommentAdminController {
  constructor(private readonly commentService: CommentService) {}

  @Delete("/:postId/:commentId")
  @HttpCode(HttpStatus.OK)
  @AdminOnly()
  @ZodEncodeResponse(AdminDeleteCommentResponseDtoSchema)
  async deleteComment(
    @CurrentUser() user: User,
    @ZodParam("postId", idParamSchema) postId: number,
    @ZodParam("commentId", idParamSchema) commentId: number,
  ): Promise<AdminDeleteCommentSuccessResponseDto> {
    await this.commentService.adminDeleteComment(postId, commentId, user.id);
    return { success: true, data: null };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @AdminOnly()
  @ZodEncodeResponse(AdminListCommentsResponseDtoSchema)
  async listAdminComments(
    @ZodQuery(AdminListCommentsQueryDtoSchema) query: AdminListCommentsQueryDto,
  ): Promise<AdminListCommentsSuccessResponseDto> {
    const { items: entries, totalCount } =
      await this.commentService.adminListComments({
        page: query.page,
        limit: query.limit,
        orderBy: query.orderBy,
        isReported: query.isReported,
        query: query.query,
      });

    return {
      success: true,
      data: {
        comments: entries.map((comment) => ({
          type: "active",
          id: comment.comment.id,
          content: comment.comment.content,
          createdAt: comment.comment.createdAt,
          updatedAt: comment.comment.updatedAt,
          reportCount: comment.additional.reportCount,
          author: {
            nickname: comment.comment.nickname,
          },
          post: {
            id: comment.comment.post.id,
            content: comment.comment.post.content,
          },
        })),
        totalCount,
      },
    };
  }
}
