import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Resource, ResourceCategory } from "./entities/resource.entity";
import { InvalidCursorError } from "src/common/errors/pagination.errors";
import {
  CursorPaginationOptions,
  CursorPaginationResult,
  OffsetPaginationOptions,
  OffsetPaginationResult,
} from "src/common/helpers/pagination";

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

type CursorPayload = {
  category: ResourceCategory | null;
  orderBy: ListResourcesOrderBy;
  orderDirection: "asc" | "desc";
  cursorValue: string;
  cursorId: number;
};

function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeCursor(cursor: string): CursorPayload {
  try {
    return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
  } catch {
    throw new InvalidCursorError();
  }
}

const orderByMap: Record<
  ListResourcesOrderBy,
  {
    path: string;
    column: string;
    cast: string;
    getValue: (resource: Resource) => string;
  }
> = {
  createdAt: {
    path: "resource.createdAt",
    column: "extract(epoch FROM resource.createdAt)::int",
    cast: "extract(epoch FROM :cursorValue::timestamp)::int",
    getValue: (resource) => resource.createdAt.toString(),
  },
};

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
      .orderBy(orderEntry.path, sqlDirection)
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
    const decodedCursor = cursor && decodeCursor(cursor);

    if (
      decodedCursor &&
      ((category ?? null) !== decodedCursor.category ||
        orderBy !== decodedCursor.orderBy ||
        orderDirection !== decodedCursor.orderDirection)
    ) {
      throw new InvalidCursorError();
    }

    const qb = this.resourceRepository.createQueryBuilder("resource");

    if (category) {
      qb.where("resource.category = :category", { category });
    }

    const cursorOp = orderDirection === "asc" ? ">" : "<";
    const orderEntry = orderByMap[orderBy];

    if (decodedCursor) {
      qb.andWhere(
        [
          `(${orderEntry.column}, "resource"."id")`,
          cursorOp,
          `(${orderEntry.cast}, :cursorId::int)`,
        ].join(""),
        {
          cursorValue: decodedCursor.cursorValue,
          cursorId: decodedCursor.cursorId,
        },
      );
    }

    const sqlDirection = orderDirection === "asc" ? "ASC" : "DESC";

    const items = await qb
      .orderBy(orderEntry.path, sqlDirection)
      .addOrderBy("resource.id", sqlDirection)
      .take(limit + 1)
      .getMany();

    const resultItems = items.slice(0, limit);
    const lastItem = resultItems.at(-1);
    return {
      items: resultItems,
      nextCursor:
        items.length > limit && lastItem
          ? encodeCursor({
              orderBy,
              orderDirection,
              category: category ?? null,
              cursorId: lastItem.id,
              cursorValue: orderEntry.getValue(lastItem),
            })
          : undefined,
    };
  }
}
