import { Module } from '@nestjs/common';
import { SalesOrdersController } from './sales-orders.controller';
import { SalesOrdersService } from './sales-orders.service';
import { SalesOrdresRepository } from 'src/repositories/salesOrder.repository';
import { DatabaseService } from 'src/database/database.service';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [CustomersModule],
  controllers: [SalesOrdersController],
  providers: [SalesOrdersService,SalesOrdresRepository,DatabaseService]
})
export class SalesOrdersModule {}
