import { Temporal } from "@js-temporal/polyfill";
import z from "zod";

export const dateSerializerCodec = z.codec(
  z.iso.datetime(),
  z.instanceof(Temporal.Instant),
  {
    decode: (str) => Temporal.Instant.from(str),
    encode: (instant) => instant.toString(),
  },
);

export const numberSerializerCodec = z.codec(
  z.string().regex(z.regexes.number),
  z.number(),
  {
    decode: (str) => Number.parseFloat(str),
    encode: (num) => num.toString(),
  },
);

export const booleanSerializerCodec = z.codec(
  z.enum(["true", "false"]),
  z.boolean(),
  {
    decode: (str) => (str === "true" ? true : false),
    encode: (bool) => (bool ? "true" : "false"),
  },
);
