import { ExceptionFilter, Catch, ArgumentsHost } from "@nestjs/common";
import type { Response } from "express";
import { ServiceError } from "src/common/errors/service.error";

@Catch(ServiceError)
export class ServiceExceptionFilter implements ExceptionFilter {
  catch(exception: ServiceError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    res.status(exception.statusCode).json({
      success: false,
      statusCode: exception.statusCode,
      errorCode: exception.errorCode,
    });
  }
}
