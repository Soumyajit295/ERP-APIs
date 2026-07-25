import { Module } from '@nestjs/common';
import { TenantModulesService } from './tenant-modules.service';
import { ModuleRepository } from 'src/repositories/module.repository';
import { TenantModulesController } from './tenant-modules.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
    controllers: [TenantModulesController],
    providers: [TenantModulesService,ModuleRepository,DatabaseService]
})
export class TenantModulesModule {}
