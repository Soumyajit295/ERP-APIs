import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser'
import { JwtAuthGuard } from './modules/auth/jwtAuth.guard';
import { PermissionGuard } from './modules/auth/permission.guard';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser())
  setupSwagger(app);
  const jwtAuthGuard = app.get(JwtAuthGuard)
  const permissionGuard = app.get(PermissionGuard)
  app.useGlobalGuards(jwtAuthGuard, permissionGuard)
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
