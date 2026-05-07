// helpers for cursor pagination in services.

import { z } from "zod";
import { ObjectLiteral, SelectQueryBuilder } from "typeorm";
import { InvalidCursorError } from "../errors/pagination.errors";

const cursorPayloadSchema = z.object({
  value: z.string(),
  id: z.number(),
});

type CursorPayload = z.output<typeof cursorPayloadSchema>;

const cursorCodec = {
  encode(payload: CursorPayload): string {
    return Buffer.from(JSON.stringify(payload)).toString("base64url");
  },

  decode(cursor: string): CursorPayload {
    try {
      const json = JSON.parse(
        Buffer.from(cursor, "base64url").toString("utf8"),
      );
      return cursorPayloadSchema.parse(json);
    } catch {
      throw new InvalidCursorError();
    }
  },
};

export type ExecuteCursorPaginationOptions<T extends ObjectLiteral> = {
  cursor?: string | undefined;
  orderByField: {
    // see post-query.service.ts
    sqlPath: string; // 'path'
    sqlCursorValue: string; // 'column'
    toCursorValue: (entity: T) => number; // 'getValue'
  };
  orderDirection: "asc" | "desc";
  limit: number;
};

export type ExecuteCursorPaginationResult<T> = {
  items: T[];
  nextCursor: string | undefined;
};

export async function executeCursorPagination<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  {
    cursor,
    orderByField,
    orderDirection,
    limit,
  }: ExecuteCursorPaginationOptions<T>,
): Promise<ExecuteCursorPaginationResult<T>> {
  const decodedCursor = cursor ? cursorCodec.decode(cursor) : undefined;
  const sqlDirection = orderDirection === "asc" ? "ASC" : "DESC";
  const cursorOp = orderDirection === "asc" ? ">" : "<";

  if (decodedCursor) {
    qb.andWhere(
      `(${orderByField.sqlCursorValue}, "${qb.alias}"."id") ${cursorOp} (:cursorValue::int, :cursorId::int)`,
      { cursorValue: decodedCursor.value, cursorId: decodedCursor.id },
    );
  }

  const items = await qb
    .orderBy(orderByField.sqlPath, sqlDirection)
    .addOrderBy(`${qb.alias}.id`, sqlDirection)
    .take(limit + 1)
    .getMany();

  const resultItems = items.slice(0, limit);
  const lastItem = resultItems.at(-1);
  return {
    items: resultItems,
    nextCursor:
      items.length > limit && lastItem
        ? cursorCodec.encode({
            id: lastItem.id,
            value: String(orderByField.toCursorValue(lastItem)),
          })
        : undefined,
  };
}
