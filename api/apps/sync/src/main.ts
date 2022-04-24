import { NestFactory } from '@nestjs/core';
import { SyncModule } from './sync.module';

async function bootstrap() {
  const app = await NestFactory.create(SyncModule);
  await app.listen(process.env.PORT);
}
bootstrap();
