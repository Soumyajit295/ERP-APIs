import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { GenerateTokensProvider } from './providers/genearateToken.provider';
import { DatabaseService } from 'src/database/database.service';
import { JwtModule } from '@nestjs/jwt';
import { RefreshTokensRepository } from 'src/repositories/refresh-token.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '../redis/redis.module';
import { EmailModule } from '../email/email.module';
import { JwtAuthGuard } from './jwtAuth.guard';
import { PermissionGuard } from './permission.guard';
import { PermissionRepository } from 'src/repositories/permission.repository';

@Module({
  imports: [
    UsersModule,
    RedisModule,
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET')
      })
    })
  ],
  controllers: [AuthController],
  providers: [AuthService,GenerateTokensProvider,RefreshTokensRepository,DatabaseService,JwtAuthGuard,PermissionGuard,PermissionRepository],
  exports: [JwtAuthGuard,PermissionGuard]
})
export class AuthModule {}
