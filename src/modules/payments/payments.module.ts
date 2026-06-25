import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentRepository } from 'src/repositories/payment.repository';
import { DatabaseService } from 'src/database/database.service';
import { InvoiceModule } from '../invoice/invoice.module';
import { PurchaseOrdersModule } from '../purchase-orders/purchase-orders.module';

@Module({
  imports: [InvoiceModule, PurchaseOrdersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService,PaymentRepository,DatabaseService]
})
export class PaymentsModule {}
