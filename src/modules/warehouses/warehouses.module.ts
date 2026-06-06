import { Module } from '@nestjs/common';
import { WarehousesController } from './warehouses.controller';
import { WarehousesService } from './warehouses.service';
import { WarehouseRepository } from 'src/repositories/warehouse.repository';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [WarehousesController],
  providers: [WarehousesService,WarehouseRepository,DatabaseService]
})
export class WarehousesModule {}
