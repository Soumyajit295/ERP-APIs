import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from 'src/repositories/user.repository';
import { DatabaseService } from 'src/database/database.service';
import { TenantRepository } from 'src/repositories/tenant.repository';
import { PermissionRepository } from 'src/repositories/permission.repository';
import { UsersController } from './users.controller';

@Module({
  providers: [UsersService,UsersRepository,TenantRepository,PermissionRepository,DatabaseService],
  exports: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
