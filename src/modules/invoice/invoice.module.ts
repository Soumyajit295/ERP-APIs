import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { InvoiceRepository } from 'src/repositories/invoice.repository';
import { DatabaseService } from 'src/database/database.service';
import { CustomersModule } from '../customers/customers.module';
import { SalesOrdersModule } from '../sales-orders/sales-orders.module';

@Module({
  imports: [CustomersModule, SalesOrdersModule],
  controllers: [InvoiceController],
  providers: [InvoiceService,InvoiceRepository,DatabaseService],
  exports: [InvoiceService, InvoiceRepository]
})
export class InvoiceModule {}
