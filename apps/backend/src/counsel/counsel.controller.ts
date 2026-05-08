import type {
  CreateCounselRequestDto,
  CreateCounselSuccessResponseDto,
  DeleteCounselSuccessResponseDto,
  GetCounselSuccessResponseDto,
  ListCounselsQueryDto,
  ListCounselsSuccessResponseDto,
  UpdateCounselRequestDto,
  UpdateCounselSuccessResponseDto,
} from "@mindseed/api-types";
import {
  CreateCounselRequestDtoSchema,
  CreateCounselResponseDtoSchema,
  DeleteCounselResponseDtoSchema,
  GetCounselResponseDtoSchema,
  idParamSchema,
  ListCounselsQueryDtoSchema,
  ListCounselsResponseDtoSchema,
  UpdateCounselRequestDtoSchema,
  UpdateCounselResponseDtoSchema,
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
import { CounselMutationService } from "./counsel-mutation.service";
import { CounselQueryService } from "./counsel-query.service";
import { categoryMap } from "./counsel.mappers";

@Controller("/counsels")
export class CounselController {
  constructor(
    private readonly counselQueryService: CounselQueryService,
    private readonly counselMutationService: CounselMutationService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UserOnly()
  @ZodEncodeResponse(CreateCounselResponseDtoSchema)
  async createCounsel(
    @CurrentUser() user: User,
    @ZodBody(CreateCounselRequestDtoSchema) body: CreateCounselRequestDto,
  ): Promise<CreateCounselSuccessResponseDto> {
    const entry = await this.counselMutationService.createCounselEntry({
      userId: user.id,
      title: body.title,
      content: body.content,
      category: categoryMap.decode(body.category),
    });
    return { success: true, data: { id: entry.id } };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UserOnly()
  @ZodEncodeResponse(ListCounselsResponseDtoSchema)
  async listCounsels(
    @ZodQuery(ListCounselsQueryDtoSchema) query: ListCounselsQueryDto,
  ): Promise<ListCounselsSuccessResponseDto> {
    const { items, nextCursor } =
      await this.counselQueryService.listCounselEntriesWithCursor({
        cursor: query.cursor,
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
        nextCursor: nextCursor ?? null,
      },
    };
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @UserOnly()
  @ZodEncodeResponse(GetCounselResponseDtoSchema)
  async getCounsel(
    @ZodParam("id", idParamSchema) id: number,
  ): Promise<GetCounselSuccessResponseDto> {
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

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @UserOnly()
  @ZodEncodeResponse(UpdateCounselResponseDtoSchema)
  async updateCounsel(
    @CurrentUser() user: User,
    @ZodParam("id", idParamSchema) id: number,
    @ZodBody(UpdateCounselRequestDtoSchema) body: UpdateCounselRequestDto,
  ): Promise<UpdateCounselSuccessResponseDto> {
    await this.counselMutationService.updateCounselEntry({
      id,
      userId: user.id,
      title: body.title,
      content: body.content,
      category: categoryMap.decode(body.category),
    });
    return { success: true, data: null };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @UserOnly()
  @ZodEncodeResponse(DeleteCounselResponseDtoSchema)
  async deleteCounsel(
    @CurrentUser() user: User,
    @ZodParam("id", idParamSchema) id: number,
  ): Promise<DeleteCounselSuccessResponseDto> {
    await this.counselMutationService.deleteCounselEntry(id, user.id);
    return { success: true, data: null };
  }
}
