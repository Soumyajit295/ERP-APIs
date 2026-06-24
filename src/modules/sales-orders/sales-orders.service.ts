import { Injectable } from '@nestjs/common';
import { CreateSalesOrderDto, GetSalesOrderQueryDto, UpdateSalesOrderStatusDto } from 'src/common/dto/sales-order.dto';
import { SalesOrdresRepository } from 'src/repositories/salesOrder.repository';

@Injectable()
export class SalesOrdersService {
    constructor(
        private readonly salesOrderRepository: SalesOrdresRepository
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

    public async getSalesOrderDashboard(salesOrderId: string,tenantId: string){
        return await this.salesOrderRepository.getSalesOrderDashboard(tenantId,salesOrderId)
    }

    public async getSalesOrderItems(salesOrderId: string,tenantId: string){
        return await this.salesOrderRepository.getSalesOrderItemsDetails(salesOrderId,tenantId)
    }

    public async salesOrderOptions(tenantId: string){
        return await this.salesOrderRepository.salesOrderOptions(tenantId)
    }
}
