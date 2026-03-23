import z from "zod";

export const dateTimeCodec = z.codec(z.iso.datetime(), z.date(), {
  decode: (str) => new Date(str),
  encode: (date) => date.toISOString(),
});
