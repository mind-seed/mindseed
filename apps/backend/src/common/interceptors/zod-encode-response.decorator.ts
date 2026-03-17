import { UseInterceptors } from "@nestjs/common";
import z from "zod";
import { ZodEncodeResponseInterceptor } from "./zod-encode-response.interceptor";

export const ZodEncodeResponse = <T extends z.ZodTypeAny>(schema: T) =>
  UseInterceptors(new ZodEncodeResponseInterceptor(schema));
