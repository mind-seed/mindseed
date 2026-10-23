import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CounselCategory, CounselEntry } from "./entities/counsel-entry.entity";
import { CounselNotFoundError, NotCounselAuthorError } from "./counsel.errors";
import {
  CursorPaginationOptions,
  CursorPaginationResult,
  OffsetPaginationOptions,
  OffsetPaginationResult,
} from "src/common/helpers/pagination";
import { executeCursorPagination } from "src/common/helpers/cursor";

export type ListCounselEntriesOrderBy = "createdAt";

export type ListCounselEntriesWithOffsetOptions =
  OffsetPaginationOptions<ListCounselEntriesOrderBy> & {
    authorId?: number;
    category?: CounselCategory;
    responded?: boolean;
  };

export type ListCounselEntriesWithOffsetResult =
  OffsetPaginationResult<CounselEntry>;

export type ListCounselEntriesWithCursorOptions =
  CursorPaginationOptions<ListCounselEntriesOrderBy> & {
    authorId?: number;
    category?: CounselCategory;
    responded?: boolean;
  };

export type ListCounselEntriesWithCursorResult =
  CursorPaginationResult<CounselEntry>;

const orderByMap = {
  createdAt: {
    sqlPath: "counsel.createdAt",
    sqlCursorValue: "extract(epoch FROM counsel.createdAt)::int",
    toCursorValue: (entry: CounselEntry) =>
      Math.floor(entry.createdAt.epochMilliseconds / 1000),
  },
} satisfies Record<ListCounselEntriesOrderBy, object>;

/**
 * CounselEntry의 조회와 관련된 부분을 담당한다.
 */
@Injectable()
export class CounselQueryService {
  constructor(
    @InjectRepository(CounselEntry)
    private readonly counselEntryRepository: Repository<CounselEntry>,
  ) {}

  /**
   * offset-based pagination option을 적용하여 counsel entry 목록을 조회한다.
   */
  async listCounselEntriesWithOffset({
    offset,
    limit,
    authorId,
    category,
    responded,
    orderBy,
    orderDirection,
  }: ListCounselEntriesWithOffsetOptions): Promise<ListCounselEntriesWithOffsetResult> {
    const qb = this.counselEntryRepository.createQueryBuilder("counsel");

    if (authorId !== undefined) {
      qb.where("counsel.authorId = :authorId", { authorId });
    }
    if (category) {
      qb.andWhere("counsel.category = :category", { category });
    }
    if (responded !== undefined) {
      qb.andWhere(
        responded
          ? "counsel.responseContent IS NOT NULL"
          : "counsel.responseContent IS NULL",
      );
    }

    const orderEntry = orderByMap[orderBy];
    const sqlDirection = orderDirection === "asc" ? "ASC" : "DESC";

    const items = await qb
      .orderBy(orderEntry.sqlPath, sqlDirection)
      .addOrderBy("counsel.id", sqlDirection)
      .skip(offset)
      .take(limit + 1)
      .getMany();

    return {
      items: items.slice(0, limit),
      hasNext: items.length > limit,
    };
  }

  /**
   * cursor-based pagination option을 적용하여 counsel entry 목록을 조회한다.
   */
  async listCounselEntriesWithCursor({
    cursor,
    limit,
    authorId,
    category,
    responded,
    orderBy,
    orderDirection,
  }: ListCounselEntriesWithCursorOptions): Promise<ListCounselEntriesWithCursorResult> {
    const qb = this.counselEntryRepository.createQueryBuilder("counsel");

    if (authorId !== undefined) {
      qb.where("counsel.authorId = :authorId", { authorId });
    }
    if (category) {
      qb.andWhere("counsel.category = :category", { category });
    }
    if (responded !== undefined) {
      qb.andWhere(
        responded
          ? "counsel.responseContent IS NOT NULL"
          : "counsel.responseContent IS NULL",
      );
    }

    return executeCursorPagination(qb, {
      cursor,
      orderByField: orderByMap[orderBy],
      orderDirection,
      limit,
    });
  }

  /**
   * id를 기반으로 counsel entry를 조회한다.
   * @throws CounselNotFoundError - counsel entry가 존재하지 않는 경우
   */
  async getCounselEntry(id: number, authorId?: number): Promise<CounselEntry> {
    const entry = await this.counselEntryRepository.findOneBy({ id });
    if (!entry) {
      throw new CounselNotFoundError();
    }
    if (authorId !== undefined && entry.authorId !== authorId) {
      throw new NotCounselAuthorError();
    }
    return entry;
  }
}
