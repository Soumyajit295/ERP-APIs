import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from 'src/repositories/user.repository';
import { DatabaseService } from 'src/database/database.service';
import { TenantRepository } from 'src/repositories/tenant.repository';

@Module({
  providers: [UsersService,UsersRepository,TenantRepository,DatabaseService],
  exports: [UsersService]
})
export class UsersModule {}
