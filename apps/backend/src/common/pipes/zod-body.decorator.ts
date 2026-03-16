import { Body } from "@nestjs/common";
import { ZodType } from "zod";
import { ZodValidationPipe } from "./zod-validation.pipe";

export const ZodBody = (schema: ZodType) => Body(new ZodValidationPipe(schema));
