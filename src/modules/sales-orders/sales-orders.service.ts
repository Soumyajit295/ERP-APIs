import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateSalesOrderDto, GetSalesOrderQueryDto, UpdateSalesOrderStatusDto } from 'src/common/dto/sales-order.dto';
import { SalesOrdresRepository } from 'src/repositories/salesOrder.repository';
import { PdfService } from '../pdf/pdf.service';
import { buildSalesOrderHtml } from './templates/sales-order.template';

@Injectable()
export class SalesOrdersService {
    private readonly logger = new Logger(SalesOrdersService.name);

    constructor(
        private readonly salesOrderRepository: SalesOrdresRepository,
        private readonly pdfService: PdfService
    ){}

    public async createSalesOrder(createSalesOrderDto: CreateSalesOrderDto,tenantId: string){
        return await this.salesOrderRepository.createSalesOrder(createSalesOrderDto,tenantId)
    }

    public async updateSalesOrderStatus(updateSalesOrderStatusDto: UpdateSalesOrderStatusDto,salesOrderId: string,tenantId: string){
        return await this.salesOrderRepository.updateSalesOrderStatus(updateSalesOrderStatusDto,salesOrderId,tenantId)
    }

    public async getSalesOrders(getSalesOrderQueryDto: GetSalesOrderQueryDto,tenantId: string){
        return await this.salesOrderRepository.getPaginatedSalesOrders(getSalesOrderQueryDto,tenantId)
    }

    public async getSalesOrderDetails(salesOrderId: string,tenantId: string){
        const [dashboard, itemsData] = await Promise.all([
            this.salesOrderRepository.getSalesOrderDashboard(tenantId, salesOrderId),
            this.salesOrderRepository.getSalesOrderItemsDetails(salesOrderId, tenantId)
        ])
        return {
            ...dashboard,
            items: itemsData.items
        }
    }

    public async salesOrderOptions(tenantId: string){
        return await this.salesOrderRepository.salesOrderOptions(tenantId)
    }

    public async downloadPdf(salesOrderId: string, tenantId: string){
        try {
            const salesOrderDetails = await this.getSalesOrderDetails(salesOrderId, tenantId)

            const html = buildSalesOrderHtml(salesOrderDetails)

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
                fileName: `${salesOrderDetails.salesOrderNumber}.pdf`,
            }
        } catch (error) {
            this.logger.error(`Failed to generate PDF for sales order ${salesOrderId}`, error)
            throw new InternalServerErrorException('Failed to generate sales order PDF')
        }
    }
}
