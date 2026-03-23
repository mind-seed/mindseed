import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { ServiceExceptionFilter } from "./common/filters/service-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalFilters(
    new GlobalExceptionFilter(),
    new ServiceExceptionFilter(),
  );
  await app.listen(process.env.PORT ?? 8000);
}

bootstrap();
