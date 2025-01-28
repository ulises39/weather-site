import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { environment } from './config/env/env-validation';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Main');
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  await app.listen(environment.runningPort);

  logger.log(`Weather-API is listening on port ${environment.runningPort}`);
}
bootstrap();
