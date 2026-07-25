import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionRepository } from 'src/repositories/permission.repository';
import { DatabaseService } from 'src/database/database.service';
import { PermissionsController } from './permissions.controller';

@Module({
  providers: [PermissionsService,PermissionRepository,DatabaseService],
  exports: [PermissionsService],
  controllers: [PermissionsController]
})
export class PermissionsModule {}
