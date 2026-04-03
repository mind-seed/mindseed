import type {
  AdminCreateResourceRequestDto,
  AdminCreateResourceSuccessResponseDto,
  AdminDeleteResourceSuccessResponseDto,
  AdminListResourcesQueryDto,
  AdminListResourcesSuccessResponseDto,
  AdminUpdateResourceRequestDto,
  AdminUpdateResourceSuccessResponseDto,
} from "@mindseed/api-types";
import {
  AdminCreateResourceRequestDtoSchema,
  AdminCreateResourceResponseDtoSchema,
  AdminDeleteResourceResponseDtoSchema,
  AdminListResourcesQueryDtoSchema,
  AdminListResourcesResponseDtoSchema,
  AdminUpdateResourceRequestDtoSchema,
  AdminUpdateResourceResponseDtoSchema,
  idParamSchema,
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
import { AdminOnly } from "src/auth/decorators/auth.decorators";
import { ZodEncodeResponse } from "src/common/interceptors/zod-encode-response.decorator";
import {
  ZodBody,
  ZodParam,
  ZodQuery,
} from "src/common/pipes/zod-validation.decorator";
import { ResourceMutationService } from "./resource-mutation.service";
import { ResourceQueryService } from "./resource-query.service";
import {
  apiToEntityCategory,
  apiToEntityType,
  entityToApiCategory,
  entityToApiType,
} from "./resource.mappers";

@Controller("/admin/resources")
export class ResourceAdminController {
  constructor(
    private readonly resourceQueryService: ResourceQueryService,
    private readonly resourceMutationService: ResourceMutationService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @AdminOnly()
  @ZodEncodeResponse(AdminListResourcesResponseDtoSchema)
  async listResources(
    @ZodQuery(AdminListResourcesQueryDtoSchema)
    query: AdminListResourcesQueryDto,
  ): Promise<AdminListResourcesSuccessResponseDto> {
    const { items, hasNext } =
      await this.resourceQueryService.listResourcesWithOffset({
        offset: query.offset,
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
        items: items.map((r) => ({
          id: r.id,
          title: r.title,
          type: entityToApiType[r.type],
          category: entityToApiCategory[r.category],
          url: r.url,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
        hasNext,
      },
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @AdminOnly()
  @ZodEncodeResponse(AdminCreateResourceResponseDtoSchema)
  async createResource(
    @ZodBody(AdminCreateResourceRequestDtoSchema)
    body: AdminCreateResourceRequestDto,
  ): Promise<AdminCreateResourceSuccessResponseDto> {
    const resource = await this.resourceMutationService.createResource({
      title: body.title,
      type: apiToEntityType[body.type],
      category: apiToEntityCategory[body.category],
      url: body.url,
    });

    return {
      success: true,
      data: {
        id: resource.id,
        title: resource.title,
        type: entityToApiType[resource.type],
        category: entityToApiCategory[resource.category],
        url: resource.url,
        createdAt: resource.createdAt,
        updatedAt: resource.updatedAt,
      },
    };
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @AdminOnly()
  @ZodEncodeResponse(AdminUpdateResourceResponseDtoSchema)
  async updateResource(
    @ZodParam("id", idParamSchema) id: number,
    @ZodBody(AdminUpdateResourceRequestDtoSchema)
    body: AdminUpdateResourceRequestDto,
  ): Promise<AdminUpdateResourceSuccessResponseDto> {
    await this.resourceMutationService.updateResource({
      resourceId: id,
      title: body.title,
      type: apiToEntityType[body.type],
      category: apiToEntityCategory[body.category],
      url: body.url,
    });
    return { success: true, data: null };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @AdminOnly()
  @ZodEncodeResponse(AdminDeleteResourceResponseDtoSchema)
  async deleteResource(
    @ZodParam("id", idParamSchema) id: number,
  ): Promise<AdminDeleteResourceSuccessResponseDto> {
    await this.resourceMutationService.deleteResource(id);
    return { success: true, data: null };
  }
}
