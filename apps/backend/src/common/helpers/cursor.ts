import { z } from "zod";
import { InvalidCursorError } from "../errors/pagination.errors";

export function createCursorCodec<I, O>(schema: z.ZodType<O, I>) {
  return {
    encode(payload: O): string {
      return Buffer.from(JSON.stringify(schema.encode(payload))).toString(
        "base64url",
      );
    },

    decode(cursor: string): O {
      try {
        const json = JSON.parse(
          Buffer.from(cursor, "base64url").toString("utf8"),
        );
        return schema.decode(json);
      } catch {
        throw new InvalidCursorError();
      }
    },
  };
}
