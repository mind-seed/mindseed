import z from "zod";

export const dateSerializerCodec = z.codec(z.iso.datetime(), z.date(), {
  decode: (str) => new Date(str),
  encode: (date) => date.toISOString(),
});

export const numberSerializerCodec = z.codec(
  z.string().regex(z.regexes.number),
  z.number(),
  {
    decode: (str) => Number.parseFloat(str),
    encode: (num) => num.toString(),
  },
);
