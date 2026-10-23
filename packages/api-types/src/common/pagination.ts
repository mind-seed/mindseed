import z from "zod";
import { numberSerializerCodec } from "src/common/codecs";

export const CursorPaginationQuerySchema = <
  T extends readonly [string, ...string[]],
>(
  orderByFields: T,
) =>
  z.object({
    cursor: z.string().optional(),
    limit: numberSerializerCodec.pipe(z.int().min(1)).default(10),
    orderBy: z.enum([...orderByFields]).default(orderByFields[0]),
    orderDirection: z.enum(["asc", "desc"]).default("asc"),
  });

export const CursorPaginatedResultSchema = <T extends z.ZodTypeAny>(
  schema: T,
) =>
  z.object({
    items: z.array(schema),
    nextCursor: z.string().nullable(),
  });

export const OffsetPaginationQuerySchema = <
  T extends readonly [string, ...string[]],
>(
  orderByFields: T,
) =>
  z.object({
    offset: numberSerializerCodec.pipe(z.int().min(0)).default(0),
    limit: numberSerializerCodec.pipe(z.int().min(1)).default(10),
    orderBy: z.enum([...orderByFields]).default(orderByFields[0]),
    orderDirection: z.enum(["asc", "desc"]).default("asc"),
  });

export const OffsetPaginatedResultSchema = <T extends z.ZodTypeAny>(
  schema: T,
) =>
  z.object({
    items: z.array(schema),
    hasNext: z.boolean(),
  });
