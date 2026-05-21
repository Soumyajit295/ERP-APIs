import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser'
import { JwtAuthGuard } from './modules/auth/jwtAuth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser())
  const jwtAuthGuard = app.get(JwtAuthGuard)
  app.useGlobalGuards(jwtAuthGuard)
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
