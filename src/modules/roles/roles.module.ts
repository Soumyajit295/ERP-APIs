import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { RolesService } from './roles.service';
import { RolesRepository } from 'src/repositories/role.repository';
import { DatabaseService } from 'src/database/database.service';

@Module({
  imports: [JwtModule],
  controllers: [RolesController],
  providers: [RolesService,RolesRepository,DatabaseService]
})
export class RolesModule {}
