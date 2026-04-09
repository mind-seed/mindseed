import type {
  ListResourcesQueryDto,
  ListResourcesResponseDto,
} from "@mindseed/api-types";
import {
  ListResourcesQueryDtoSchema,
  ListResourcesResponseDtoSchema,
} from "@mindseed/api-types";
import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ZodEncodeResponse } from "src/common/interceptors/zod-encode-response.decorator";
import { ZodQuery } from "src/common/pipes/zod-validation.decorator";
import { ResourceQueryService } from "./resource-query.service";
import { categoryMap, typeMap } from "./resource.mappers";
import { UserOnly } from "src/auth/decorators/auth.decorators";

@Controller("/resources")
export class ResourceController {
  constructor(private readonly resourceQueryService: ResourceQueryService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UserOnly()
  @ZodEncodeResponse(ListResourcesResponseDtoSchema)
  async listResources(
    @ZodQuery(ListResourcesQueryDtoSchema)
    query: ListResourcesQueryDto,
  ): Promise<ListResourcesResponseDto> {
    const { items, nextCursor } =
      await this.resourceQueryService.listResourcesWithCursor({
        cursor: query.cursor,
        limit: query.limit,
        category: query.category
          ? categoryMap.decode(query.category)
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
          type: typeMap.encode(r.type),
          category: categoryMap.encode(r.category),
          url: r.url,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
        nextCursor: nextCursor ?? null,
      },
    };
  }
}
