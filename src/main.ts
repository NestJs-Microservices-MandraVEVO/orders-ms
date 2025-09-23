import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {

  const logger = new Logger('Orders-main');

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3003);
  logger.log(`Orders service running on port ${process.env.PORT ?? 3003}`);
}
bootstrap();
