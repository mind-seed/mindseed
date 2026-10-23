import {
  Injectable,
  ExecutionContext,
  NestInterceptor,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import * as z from "zod";

@Injectable()
export class ZodEncodeResponseInterceptor<
  T extends z.ZodTypeAny,
> implements NestInterceptor {
  constructor(private readonly schema: T) {}

  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<z.input<T>> {
    return next.handle().pipe(map((data) => this.schema.encode(data)));
  }
}
