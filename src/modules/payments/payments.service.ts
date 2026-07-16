import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreatePaymentDto, GetPaymentsQueryDto } from 'src/common/dto/payment.dto';
import { PaymentDirection } from 'src/common/enums/payment.enum';
import { PaymentRepository } from 'src/repositories/payment.repository';
import { InvoiceService } from '../invoice/invoice.service';
import { PurchaseOrdersService } from '../purchase-orders/purchase-orders.service';
import { PdfService } from '../pdf/pdf.service';
import { buildPaymentReciptHtml } from './templates/payment-recipt.template';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);

    constructor(
        private readonly paymentRepository: PaymentRepository,
        private readonly invoiceService: InvoiceService,
        private readonly purchaseOrderService: PurchaseOrdersService,
        private readonly pdfService: PdfService
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

    public async downloadRecipt(paymentId: string,tenantId: string){
        try {
            const paymentDetails = await this.getPaymentDashboardData(paymentId,tenantId)
            const html = buildPaymentReciptHtml(paymentDetails)
            const pdfBuffer = await this.pdfService.generatePdf(html, {
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '10mm',
                    right: '10mm',
                    bottom: '10mm',
                    left: '10mm',
                },
            })

            return {
                buffer: pdfBuffer,
                fileName: `${paymentDetails.paymentNumber}.pdf`,
            }
        } catch (error) {
            this.logger.error(`Failed to generate receipt PDF for payment ${paymentId}`, error)
            throw new InternalServerErrorException('Failed to generate payment receipt PDF')
        }
    }
}
