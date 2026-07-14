import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { createInvoiceDto, GetInvoiceQueryDto, updateInvoiceDto } from 'src/common/dto/invoice.dto';
import { InvoiceRepository } from 'src/repositories/invoice.repository';
import { PdfService } from '../pdf/pdf.service';
import { buildInvoiceHtml } from './templates/invoice.template';

@Injectable()
export class InvoiceService {
    private readonly logger = new Logger(InvoiceService.name);

    constructor(
        private readonly invoiceRepository: InvoiceRepository,
        private readonly pdfService: PdfService
    ){}

    public async createInvoice(createInvoiceDto: createInvoiceDto,tenantId: string){
        return await this.invoiceRepository.createInvoice(createInvoiceDto,tenantId)
    }

    public async getPaginatedInvoices(getInvoiceQueryDto: GetInvoiceQueryDto,tenantId: string){
        return await this.invoiceRepository.getPaginatedInvoices(getInvoiceQueryDto,tenantId)
    }

    public async getInvoiceDetails(invoiceId: string, tenantId: string){
        const [dashboard, itemsData] = await Promise.all([
            this.invoiceRepository.getInvoiceDashboardData(invoiceId, tenantId),
            this.invoiceRepository.getInvoiceItems(invoiceId, tenantId)
        ])
        return {
            ...dashboard,
            items: itemsData.items
        }
    }

    public async updateInvoiceDto(updateInvoiceDto: updateInvoiceDto,invoiceId: string,tenantId: string){
        return await this.invoiceRepository.updateInvoiceDetails(updateInvoiceDto,invoiceId,tenantId)
    }

    public async getInvoiceBySalesOrderId(salesOrderId: string, tenantId: string){
        return await this.invoiceRepository.getInvoiceBySalesOrder(salesOrderId, tenantId)
    }

    public async getInvoiceById(invoiceId: string,tenantId: string){
        return await this.invoiceRepository.getInvoiceById(invoiceId,tenantId)
    }

    public async downloadPdf(invoiceId: string, tenantId: string){
        try {
            const invoiceDetails = await this.getInvoiceDetails(invoiceId, tenantId)

            const html = buildInvoiceHtml(invoiceDetails)

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
                fileName: `${invoiceDetails.invoiceNumber}.pdf`,
            }
        } catch (error) {
            this.logger.error(`Failed to generate PDF for invoice ${invoiceId}`, error)
            throw new InternalServerErrorException('Failed to generate invoice PDF')
        }
    }
}
