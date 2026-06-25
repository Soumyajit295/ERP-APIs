import { Injectable } from '@nestjs/common';
import {
  CreatePurchaseOrderDto,
  GetPurchaseOrderQueryDto,
  UpdatePurchaseOrderStatusDto,
} from 'src/common/dto/purchase-order.dto';
import { PurchaseOrderRepository } from 'src/repositories/purchaseOrder.repository';

@Injectable()
export class PurchaseOrdersService {
  constructor(private readonly purchaseOrderRepository: PurchaseOrderRepository) {}

  public async createPurchaseOrder(
    createPurchaseOrderDto: CreatePurchaseOrderDto,
    tenantId: string,
  ) {
    return await this.purchaseOrderRepository.createPurchaseOrder(
      createPurchaseOrderDto,
      tenantId,
    );
  }

  public async updatePurchaseOrderStatus(
    updatePurchaseOrderDto: UpdatePurchaseOrderStatusDto,
    purchaseOrderId: string,
    tenantId: string,
  ) {
    return await this.purchaseOrderRepository.updatePurchaseOrderStatus(
      updatePurchaseOrderDto,
      purchaseOrderId,
      tenantId,
    );
  }

  public async getPaginatedPurchaseOrders(
    getPurchaseOrdersQueryDto: GetPurchaseOrderQueryDto,
    tenantId: string,
  ) {
    return await this.purchaseOrderRepository.getPaginatedPurchaseOrders(
      getPurchaseOrdersQueryDto,
      tenantId,
    );
  }

  public async getDetailsOfPurchaseOrder(
    purchaseOrderId: string,
    tenantId: string,
  ) {
    return await this.purchaseOrderRepository.getPurchaseOrderDetails(
      purchaseOrderId,
      tenantId,
    );
  }

  public async deletePurchaseOrder(purchaseOrderId: string, tenantId: string) {
    return await this.purchaseOrderRepository.deletePurchaseOrder(
      purchaseOrderId,
      tenantId,
    );
  }

  public async getPurchaseOrderById(purchaseorderId: string,tenantId: string){
    return await this.purchaseOrderRepository.getPurchaseOrderById(purchaseorderId,tenantId)
  }
}
