export type CursorPaginationOptions<OrderBy extends string> = {
  cursor?: string;
  limit: number;
  orderBy: OrderBy;
  orderDirection: "asc" | "desc";
};

export type CursorPaginationResult<Item> = {
  items: Item[];
  nextCursor?: string;
};

export type OffsetPaginationOptions<OrderBy extends string> = {
  offset: number;
  limit: number;
  orderBy: OrderBy;
  orderDirection: "asc" | "desc";
};

export type OffsetPaginationResult<Item> = {
  items: Item[];
  hasNext: boolean;
};
