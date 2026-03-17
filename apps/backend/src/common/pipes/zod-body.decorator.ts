import { Body } from "@nestjs/common";
import { ZodType } from "zod";
import { ZodDecoderPipe } from "./zod-decoder.pipe";

export const ZodBody = (schema: ZodType) => Body(new ZodDecoderPipe(schema));
