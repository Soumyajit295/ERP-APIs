import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser'
import { JwtAuthGuard } from './modules/auth/jwtAuth.guard';
import { PermissionGuard } from './modules/auth/permission.guard';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        ...(process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) ?? []),
      ].filter(Boolean),
      credentials: true,
    },
  });
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }))
  setupSwagger(app);
  const jwtAuthGuard = app.get(JwtAuthGuard)
  const permissionGuard = app.get(PermissionGuard)
  app.useGlobalGuards(jwtAuthGuard, permissionGuard)
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
