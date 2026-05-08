import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Resource, ResourceCategory } from "./entities/resource.entity";
import {
  CursorPaginationOptions,
  CursorPaginationResult,
  OffsetPaginationOptions,
  OffsetPaginationResult,
} from "src/common/helpers/pagination";
import { executeCursorPagination } from "src/common/helpers/cursor";

export type ListResourcesOrderBy = "createdAt";

export type ListResourcesWithOffsetOptions =
  OffsetPaginationOptions<ListResourcesOrderBy> & {
    category?: ResourceCategory;
  };

export type ListResourcesWithOffsetResult = OffsetPaginationResult<Resource>;

export type ListResourcesWithCursorOptions =
  CursorPaginationOptions<ListResourcesOrderBy> & {
    category?: ResourceCategory;
  };

export type ListResourcesWithCursorResult = CursorPaginationResult<Resource>;

const orderByMap = {
  createdAt: {
    sqlPath: "resource.createdAt",
    sqlCursorValue: "extract(epoch FROM resource.createdAt)::int",
    toCursorValue: (resource: Resource) =>
      Math.floor(resource.createdAt.epochMilliseconds / 1000),
  },
} satisfies Record<ListResourcesOrderBy, object>;

/**
 * AdminResourceController에서 사용하기 위한 resource의 조회를 담당한다.
 */
@Injectable()
export class ResourceQueryService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
  ) {}

  /**
   * offset-based pagination option을 적용하여 resource 목록을 조회한다.
   */
  async listResourcesWithOffset({
    offset,
    limit,
    category,
    orderBy,
    orderDirection,
  }: ListResourcesWithOffsetOptions): Promise<ListResourcesWithOffsetResult> {
    const qb = this.resourceRepository.createQueryBuilder("resource");

    if (category) {
      qb.where("resource.category = :category", { category });
    }

    const orderEntry = orderByMap[orderBy];
    const sqlDirection = orderDirection === "asc" ? "ASC" : "DESC";

    const items = await qb
      .orderBy(orderEntry.sqlPath, sqlDirection)
      .addOrderBy("resource.id", sqlDirection)
      .skip(offset)
      .take(limit + 1)
      .getMany();

    const hasNext = items.length > limit;

    return {
      items: items.slice(0, limit),
      hasNext,
    };
  }

  /**
   * cursor-based pagination option을 적용하여 resource 목록을 조회한다.
   */
  async listResourcesWithCursor({
    cursor,
    limit,
    category,
    orderBy,
    orderDirection,
  }: ListResourcesWithCursorOptions): Promise<ListResourcesWithCursorResult> {
    const qb = this.resourceRepository.createQueryBuilder("resource");

    if (category) {
      qb.where("resource.category = :category", { category });
    }

    return executeCursorPagination(qb, {
      cursor,
      orderByField: orderByMap[orderBy],
      orderDirection,
      limit,
    });
  }
}
