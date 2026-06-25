import { Injectable } from '@nestjs/common';
import { createInvoiceDto, GetInvoiceQueryDto, updateInvoiceDto } from 'src/common/dto/invoice.dto';
import { InvoiceRepository } from 'src/repositories/invoice.repository';

@Injectable()
export class InvoiceService {
    constructor(
        private readonly invoiceRepository: InvoiceRepository
    ){}

    public async createInvoice(createInvoiceDto: createInvoiceDto,tenantId: string){
        return await this.invoiceRepository.createInvoice(createInvoiceDto,tenantId)
    }

    public async getPaginatedInvoices(getInvoiceQueryDto: GetInvoiceQueryDto,tenantId: string){
        return await this.invoiceRepository.getPaginatedInvoices(getInvoiceQueryDto,tenantId)
    }

    public async getInvoiceDashboardDetails(invoiceId: string, tenantId: string){
        return await this.invoiceRepository.getInvoiceDashboardData(invoiceId,tenantId)
    }

    public async getInvoiceItemsDetails(invoiceId: string,tenantId: string){
        return await this.invoiceRepository.getInvoiceItems(invoiceId,tenantId)
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
}
