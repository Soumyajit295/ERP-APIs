import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionRepository } from 'src/repositories/permission.repository';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [PermissionsService,PermissionRepository,DatabaseService],
  exports: [PermissionsService]
})
export class PermissionsModule {}
