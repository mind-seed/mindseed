import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";
import z, { ZodType } from "zod";

@Injectable()
export class ZodDecoderPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(z.treeifyError(result.error));
    }
    return result.data;
  }
}
