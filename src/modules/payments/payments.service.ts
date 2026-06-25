import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePaymentDto, GetPaymentsQueryDto } from 'src/common/dto/payment.dto';
import { PaymentDirection } from 'src/common/enums/payment.enum';
import { PaymentRepository } from 'src/repositories/payment.repository';
import { InvoiceService } from '../invoice/invoice.service';
import { PurchaseOrdersService } from '../purchase-orders/purchase-orders.service';

@Injectable()
export class PaymentsService {
    constructor(
        private readonly paymentRepository: PaymentRepository,
        private readonly invoiceService: InvoiceService,
        private readonly purchaseOrderService: PurchaseOrdersService
    ){}

    public async createPayment(createPaymentDto: CreatePaymentDto,tenantId: string){
        const {
            paymentDirection,
            paymentMethod,
            amount,
            invoiceId,
            purchaseOrderId,
            paymentDate,
            notes,
            transactionId
        } = createPaymentDto

        let entityData;

        if(paymentDirection === PaymentDirection.RECEIVED){
            if(!invoiceId){
                throw new BadRequestException('Invoice is missing')
            }

            entityData = await this.invoiceService.getInvoiceById(invoiceId,tenantId)

            if(!entityData){
                throw new BadRequestException('Invoice not found')
            }
        }
        
        if(paymentDirection === PaymentDirection.MADE){
            if(!purchaseOrderId){
                throw new BadRequestException('Purchase order is missing')
            }

            entityData = await this.purchaseOrderService.getPurchaseOrderById(purchaseOrderId,tenantId)

            if(!entityData){
                throw new BadRequestException('Purchase order not found')
            }
        }

        return await this.paymentRepository.createPayment(createPaymentDto,tenantId,entityData)
    }

    public async getPaginatedPayments(getPaymentQueryDto: GetPaymentsQueryDto,tenantId: string){
        return await this.paymentRepository.getPaginatedPayments(getPaymentQueryDto,tenantId)
    }

    public async getPaymentDashboardData(paymentId: string,tenantId: string){
        return await this.paymentRepository.getPaymentDashboardData(paymentId,tenantId)
    }
}
