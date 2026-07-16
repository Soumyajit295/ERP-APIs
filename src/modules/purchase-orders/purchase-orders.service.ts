import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  CreatePurchaseOrderDto,
  GetPurchaseOrderOptionsQueryDto,
  GetPurchaseOrderQueryDto,
  UpdatePurchaseOrderStatusDto,
} from 'src/common/dto/purchase-order.dto';
import { PurchaseOrderRepository } from 'src/repositories/purchaseOrder.repository';
import { PdfService } from '../pdf/pdf.service';
import { buildPurchaseOrderHtml } from './templates/purchase-order.template';

@Injectable()
export class PurchaseOrdersService {
  private readonly logger = new Logger(PurchaseOrdersService.name);

  constructor(
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    private readonly pdfService: PdfService,
  ) {}

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

  public async getPurchaseOrderById(purchaseorderId: string, tenantId: string) {
    return await this.purchaseOrderRepository.getPurchaseOrderById(
      purchaseorderId,
      tenantId,
    );
  }

  public async purchaseOrderOptions(getPurchaseOrderOptionsQueryDto: GetPurchaseOrderOptionsQueryDto, tenantId: string) {
    return await this.purchaseOrderRepository.purchaseOrderOptions(getPurchaseOrderOptionsQueryDto, tenantId);
  }

  public async downloadPdf(purchaseOrderId: string, tenantId: string) {
    try {
      const purchaseOrderDetails =
        await this.purchaseOrderRepository.getPurchaseOrderDetails(
          purchaseOrderId,
          tenantId,
        );

      const html = buildPurchaseOrderHtml(purchaseOrderDetails);

      const pdfBuffer = await this.pdfService.generatePdf(html, {
        format: 'A4',
        printBackground: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm',
        },
      });

      return {
        buffer: pdfBuffer,
        fileName: `${purchaseOrderDetails.purchaseOrderNumber}.pdf`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate PDF for purchase order ${purchaseOrderId}`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to generate purchase order PDF',
      );
    }
  }
}
