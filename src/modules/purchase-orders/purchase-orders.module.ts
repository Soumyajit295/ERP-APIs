import { Module } from '@nestjs/common';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrderRepository } from 'src/repositories/purchaseOrder.repository';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService, PurchaseOrderRepository, DatabaseService],
})
export class PurchaseOrdersModule {}
