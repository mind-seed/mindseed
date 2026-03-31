import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from "@nestjs/common";
import type {
  CreateCommentRequestDto,
  CreateCommentSuccessResponseDto,
  DeleteCommentSuccessResponseDto,
  UpdateCommentRequestDto,
  UpdateCommentSuccessResponseDto,
} from "@mindseed/api-types";
import {
  CreateCommentRequestDtoSchema,
  CreateCommentResponseDtoSchema,
  DeleteCommentResponseDtoSchema,
  UpdateCommentRequestDtoSchema,
  UpdateCommentResponseDtoSchema,
  idParamSchema,
} from "@mindseed/api-types";
import { CommentService } from "./comment.service";
import { ZodBody, ZodParam } from "src/common/pipes/zod-validation.decorator";
import { ZodEncodeResponse } from "src/common/interceptors/zod-encode-response.decorator";
import { CurrentUser, UserOnly } from "src/auth/decorators/auth.decorators";
import { User } from "src/user/entities/user.entity";

@Controller("/posts/:postId/comments")
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UserOnly()
  @ZodEncodeResponse(CreateCommentResponseDtoSchema)
  async createComment(
    @CurrentUser() user: User,
    @ZodParam("postId", idParamSchema) postId: number,
    @ZodBody(CreateCommentRequestDtoSchema) body: CreateCommentRequestDto,
  ): Promise<CreateCommentSuccessResponseDto> {
    const comment = await this.commentService.createComment({
      postId,
      userId: user.id,
      nickname: body.nickname,
      content: body.content,
    });
    return { success: true, data: { id: comment.id } };
  }

  @Patch(":commentId")
  @HttpCode(HttpStatus.OK)
  @UserOnly()
  @ZodEncodeResponse(UpdateCommentResponseDtoSchema)
  async updateComment(
    @CurrentUser() user: User,
    @ZodParam("postId", idParamSchema) postId: number,
    @ZodParam("commentId", idParamSchema) commentId: number,
    @ZodBody(UpdateCommentRequestDtoSchema) body: UpdateCommentRequestDto,
  ): Promise<UpdateCommentSuccessResponseDto> {
    await this.commentService.updateComment({
      postId,
      commentId,
      userId: user.id,
      content: body.content,
    });
    return { success: true, data: null };
  }

  @Delete(":commentId")
  @HttpCode(HttpStatus.OK)
  @UserOnly()
  @ZodEncodeResponse(DeleteCommentResponseDtoSchema)
  async deleteComment(
    @CurrentUser() user: User,
    @ZodParam("postId", idParamSchema) postId: number,
    @ZodParam("commentId", idParamSchema) commentId: number,
  ): Promise<DeleteCommentSuccessResponseDto> {
    await this.commentService.deleteComment(postId, commentId, user.id);
    return { success: true, data: null };
  }
}
