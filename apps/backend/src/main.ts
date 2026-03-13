import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { AuthExceptionFilter } from "./auth/filters/auth-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalFilters(new AuthExceptionFilter(), new GlobalExceptionFilter());
  await app.listen(process.env.PORT ?? 8000);
}

bootstrap();
