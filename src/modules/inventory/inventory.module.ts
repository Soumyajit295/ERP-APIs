import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { DatabaseService } from 'src/database/database.service';
import { InventoryRepository } from 'src/repositories/inventory.repository';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService,InventoryRepository,DatabaseService]
})
export class InventoryModule {}
