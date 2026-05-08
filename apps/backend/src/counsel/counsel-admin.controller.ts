import type {
  AdminGetCounselSuccessResponseDto,
  AdminListCounselsQueryDto,
  AdminListCounselsSuccessResponseDto,
  AdminRespondToCounselRequestDto,
  AdminRespondToCounselSuccessResponseDto,
} from "@mindseed/api-types";
import {
  AdminGetCounselResponseDtoSchema,
  AdminListCounselsQueryDtoSchema,
  AdminListCounselsResponseDtoSchema,
  AdminRespondToCounselRequestDtoSchema,
  AdminRespondToCounselResponseDtoSchema,
  idParamSchema,
} from "@mindseed/api-types";
import { Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AdminOnly, CurrentUser } from "src/auth/decorators/auth.decorators";
import { ZodEncodeResponse } from "src/common/interceptors/zod-encode-response.decorator";
import {
  ZodBody,
  ZodParam,
  ZodQuery,
} from "src/common/pipes/zod-validation.decorator";
import { User } from "src/user/entities/user.entity";
import { CounselMutationService } from "./counsel-mutation.service";
import { CounselQueryService } from "./counsel-query.service";
import { categoryMap } from "./counsel.mappers";

@Controller("/admin/counsels")
export class CounselAdminController {
  constructor(
    private readonly counselQueryService: CounselQueryService,
    private readonly counselMutationService: CounselMutationService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @AdminOnly()
  @ZodEncodeResponse(AdminListCounselsResponseDtoSchema)
  async listCounsels(
    @ZodQuery(AdminListCounselsQueryDtoSchema) query: AdminListCounselsQueryDto,
  ): Promise<AdminListCounselsSuccessResponseDto> {
    const { items, hasNext } =
      await this.counselQueryService.listCounselEntriesWithOffset({
        offset: query.offset,
        limit: query.limit,
        category: query.category
          ? categoryMap.decode(query.category)
          : undefined,
        responded: query.responded,
        orderBy: query.orderBy,
        orderDirection: query.orderDirection,
      });

    return {
      success: true,
      data: {
        items: items.map((counsel) => ({
          id: counsel.id,
          title: counsel.title,
          category: categoryMap.encode(counsel.category),
          createdAt: counsel.createdAt,
          responded: counsel.responseContent !== null,
        })),
        hasNext,
      },
    };
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @AdminOnly()
  @ZodEncodeResponse(AdminGetCounselResponseDtoSchema)
  async getCounsel(
    @ZodParam("id", idParamSchema) id: number,
  ): Promise<AdminGetCounselSuccessResponseDto> {
    const entry = await this.counselQueryService.getCounselEntry(id);
    return {
      success: true,
      data: {
        id: entry.id,
        title: entry.title,
        content: entry.content,
        category: categoryMap.encode(entry.category),
        createdAt: entry.createdAt,
        response: entry.responseContent ?? undefined,
      },
    };
  }

  @Post(":id/response")
  @HttpCode(HttpStatus.OK)
  @AdminOnly()
  @ZodEncodeResponse(AdminRespondToCounselResponseDtoSchema)
  async respondToCounsel(
    @CurrentUser() user: User,
    @ZodParam("id", idParamSchema) id: number,
    @ZodBody(AdminRespondToCounselRequestDtoSchema)
    body: AdminRespondToCounselRequestDto,
  ): Promise<AdminRespondToCounselSuccessResponseDto> {
    await this.counselMutationService.respondToCounselEntry(
      id,
      user.id,
      body.response,
    );
    return { success: true, data: null };
  }
}
