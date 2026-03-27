import { Body, Param, Query } from "@nestjs/common";
import { ZodType } from "zod";
import { ZodDecoderPipe } from "./zod-decoder.pipe";

export const ZodBody = (schema: ZodType) => Body(new ZodDecoderPipe(schema));
export const ZodQuery = (schema: ZodType) => Query(new ZodDecoderPipe(schema));
export const ZodParam = (param: string, schema: ZodType) =>
  Param(param, new ZodDecoderPipe(schema));
