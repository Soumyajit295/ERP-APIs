import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  controllers: [RolesController]
})
export class RolesModule {}
