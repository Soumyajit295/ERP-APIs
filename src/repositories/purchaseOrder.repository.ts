import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedResponseDto } from 'src/common/dto/paginationResponse.dto';
import {
  CreatePurchaseOrderDto,
  GetPurchaseOrderQueryDto,
  ProductItem,
  PurchaseOrderDeatilsResponseDto,
  PurchaseOrderListResponseDto,
  UpdatePurchaseOrderStatusDto,
} from 'src/common/dto/purchase-order.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class PurchaseOrderRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async createPurchaseOrder(
    createPurchaseOrderDto: CreatePurchaseOrderDto,
    tenantId: string,
  ) {
    if (!createPurchaseOrderDto.items?.length) {
      throw new BadRequestException('Purchase order must contain at least one item');
    }

    try {
      return this.databaseService.transaction(async (client) => {
        const purchaseOrderNumber = `PO-${new Date().getFullYear()}-${Date.now()}`;

        const purchaseOrderQuery = `
                    INSERT INTO purchase_orders (
                        tenant_id,
                        po_number,
                        supplier_id,
                        warehouse_id,
                        order_date,
                        status
                    )
                    VALUES($1,$2,$3,$4,$5,$6)
                    RETURNING po_id
                `;

        const purchaseOrderValues = [
          tenantId,
          purchaseOrderNumber,
          createPurchaseOrderDto.supplierId,
          createPurchaseOrderDto.warehouseId,
          createPurchaseOrderDto.orderDate,
          createPurchaseOrderDto.status,
        ];

        const purchaseOrderResult = await client.query(
          purchaseOrderQuery,
          purchaseOrderValues,
        );

        if (purchaseOrderResult.rows.length === 0) {
          throw new Error('Failed to create purchase order');
        }

        for (const item of createPurchaseOrderDto.items) {
          const purchaseOrderItemQuery = `
                        INSERT INTO purchase_order_items (
                            po_id,
                            product_id,
                            quantity,
                            cost_price,
                            line_total
                        )
                        VALUES($1,$2,$3,$4,$5)
                        RETURNING poi_id
                    `;

          const purchaseOrderItemsValues = [
            purchaseOrderResult.rows[0]?.po_id,
            item.productId,
            item.quantity,
            item.costPrice,
            item.quantity * item.costPrice,
          ];

          const purchaseOrderItemsResult = await client.query(
            purchaseOrderItemQuery,
            purchaseOrderItemsValues,
          );

          if (purchaseOrderItemsResult.rows.length === 0) {
            throw new Error('Failed to create purchase order item');
          }
        }

        return { message: 'Purchase order created successfully' };
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Internal server error, while creating purchase order',
      );
    }
  }

  async getPaginatedPurchaseOrders(
    getPurchaseOrdersQueryDto: GetPurchaseOrderQueryDto,
    tenantId: string,
  ): Promise<PaginatedResponseDto<PurchaseOrderListResponseDto>> {
    const { page = 1, limit = 10, search, status, supplierId, warehouseId } =
      getPurchaseOrdersQueryDto;

    const currentPage = Math.max(Number(page), 1);
    const pageLimit = Math.min(Math.max(Number(limit), 1), 100);
    const offset = (currentPage - 1) * pageLimit;
    const searchParams = search?.trim() ?? null;
    const statusParams = status ?? null;
    const supplierIdParams = supplierId?.trim() ?? null;
    const warehouseParams = warehouseId?.trim() ?? null;

    try {
      const countQuery = `
                SELECT COUNT(*)::int AS total
                FROM purchase_orders po
                WHERE po.tenant_id = $1
                    AND po.deleted_at IS NULL
                    AND(
                        $2::text IS NULL
                        OR po.po_number ILIKE '%' || $2 || '%'
                    )
                    AND(
                        $3::purchase_order_status_enum IS NULL
                        OR po.status = $3
                    )
                    AND(
                        $4::uuid IS NULL
                        OR po.supplier_id = $4
                    )
                    AND(
                        $5::uuid IS NULL
                        OR po.warehouse_id = $5
                    )
            `;

      const countValues = [
        tenantId,
        searchParams,
        statusParams,
        supplierIdParams,
        warehouseParams,
      ];

      const purchaseOrderQuery = `
                SELECT 
                    po.po_id,
                    po.po_number,
                    s.supplier_name AS supplier_name,
                    w.warehouse_name AS warehouse_name,
                    po.status,
                    (
                        SELECT COALESCE(SUM(poi.line_total), 0)::float
                        FROM purchase_order_items poi
                        WHERE poi.po_id = po.po_id
                    ) AS total_cost,
                    po.order_date
                FROM purchase_orders po
                JOIN suppliers s ON s.supplier_id = po.supplier_id AND s.deleted_at IS NULL
                JOIN warehouses w ON w.warehouse_id = po.warehouse_id AND w.deleted_at IS NULL
                WHERE po.tenant_id = $1
                    AND po.deleted_at IS NULL
                    AND(
                        $4::text IS NULL
                        OR po.po_number ILIKE '%' || $4 || '%'
                    )
                    AND(
                        $5::purchase_order_status_enum IS NULL
                        OR po.status = $5
                    )
                    AND(
                        $6::uuid IS NULL
                        OR po.supplier_id = $6
                    )
                    AND(
                        $7::uuid IS NULL
                        OR po.warehouse_id = $7
                    )
                ORDER BY po.created_at DESC
                LIMIT $2
                OFFSET $3
            `;

      const purchaseOrderValues = [
        tenantId,
        pageLimit,
        offset,
        searchParams,
        statusParams,
        supplierIdParams,
        warehouseParams,
      ];

      const [countResult, purchaseOrderResult] = await Promise.all([
        this.databaseService.query(countQuery, countValues),
        this.databaseService.query(purchaseOrderQuery, purchaseOrderValues),
      ]);

      const total = countResult?.rows?.[0]?.total ?? 0;
      const totalPages = Math.ceil(total / pageLimit);

      return {
        records:
          purchaseOrderResult?.rows?.map((row: any) =>
            this.mapRowToPurchaseOrder(row),
          ) ?? [],
        meta: {
          page: currentPage,
          limit: pageLimit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Internal server error, while fetching purchase orders',
      );
    }
  }

  async updatePurchaseOrderStatus(
    updatePurchaseOrderDto: UpdatePurchaseOrderStatusDto,
    purchaseOrderId: string,
    tenantId: string,
  ) {
    try {
      const query = `
                UPDATE purchase_orders
                SET status = $1, updated_at = NOW()
                WHERE po_id = $2
                    AND tenant_id = $3
                    AND deleted_at IS NULL
                RETURNING po_id
            `;
      const values = [updatePurchaseOrderDto.status, purchaseOrderId, tenantId];
      const result = await this.databaseService.query(query, values);

      if (result.rows.length === 0) {
        throw new NotFoundException('Purchase order not found');
      }

      return { message: 'Order status updated successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Internal server error while updating purchase order status',
      );
    }
  }

  async deletePurchaseOrder(purchaseOrderId: string, tenantId: string) {
    try {
      const query = `
                UPDATE purchase_orders
                SET deleted_at = NOW(), updated_at = NOW()
                WHERE po_id = $1
                    AND tenant_id = $2
                    AND deleted_at IS NULL
                RETURNING po_id
            `;
      const values = [purchaseOrderId, tenantId];
      const result = await this.databaseService.query(query, values);

      if (result.rows.length === 0) {
        throw new NotFoundException('Purchase order not found');
      }

      return { message: 'Purchase order deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Internal server error while deleting purchase order',
      );
    }
  }

  async getPurchaseOrderDetails(
    purchaseOrderId: string,
    tenantId: string,
  ): Promise<PurchaseOrderDeatilsResponseDto> {
    try {
      const purchaseOrderItemsQuery = `
                SELECT
                    p.product_name as product_name,
                    poi.quantity as quantity,
                    poi.cost_price as cost_price,
                    poi.line_total as line_total
                FROM purchase_order_items poi
                JOIN purchase_orders po on po.po_id = poi.po_id
                JOIN products p ON p.product_id = poi.product_id
                WHERE po.po_id = $1
                    AND po.tenant_id = $2
                    AND po.deleted_at IS NULL
            `;

      const purchaseOrderItemsResult = await this.databaseService.query(
        purchaseOrderItemsQuery,
        [purchaseOrderId, tenantId],
      );

      const orderItems =
        purchaseOrderItemsResult.rows.map((row: any) =>
          this.mapRowToOrderItem(row),
        ) ?? [];

      const purchaseOrderQuery = `
                SELECT
                    po.po_number AS purchase_order_number,
                    po.po_id AS purchase_order_id,
                    po.order_date AS purchase_order_date,
                    (
                        SELECT COALESCE(SUM(poi.line_total), 0)::float
                        FROM purchase_order_items poi
                        WHERE poi.po_id = po.po_id
                    ) AS purchase_order_total_price,
                    po.status AS purchase_order_status,
                    s.supplier_name AS supplier_name,
                    s.contact_person AS supplier_contact_person,
                    s.email AS supplier_email,
                    s.phone AS supplier_phone,
                    s.address AS supplier_address,
                    w.warehouse_name AS warehouse_name,
                    w.address AS warehouse_address,
                    w.contact_person AS warehouse_contact_person,
                    w.phone AS warehouse_phone
                FROM purchase_orders po
                JOIN suppliers s ON s.supplier_id = po.supplier_id AND s.deleted_at IS NULL
                JOIN warehouses w ON w.warehouse_id = po.warehouse_id AND w.deleted_at IS NULL
                WHERE po.po_id = $1
                    AND po.tenant_id = $2
                    AND po.deleted_at IS NULL
            `;

      const purchaseOrdersResult = await this.databaseService.query(
        purchaseOrderQuery,
        [purchaseOrderId, tenantId],
      );

      if (purchaseOrdersResult.rows.length === 0) {
        throw new NotFoundException('Purchase order not found');
      }

      return this.mapRowToOrderDetails(purchaseOrdersResult.rows[0], orderItems);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Internal server error, while fetching purchase order details',
      );
    }
  }

  private mapRowToPurchaseOrder(row: any): PurchaseOrderListResponseDto {
    return {
      purchaseOrderId: row.po_id,
      purchaseOrderNumber: row.po_number,
      supplierName: row.supplier_name,
      warehouseName: row.warehouse_name,
      status: row.status,
      totalCost: Number(row.total_cost),
      orderDate: row.order_date,
    };
  }

  private mapRowToOrderItem(row: any): ProductItem {
    return {
      productName: row.product_name,
      quantity: Number(row.quantity),
      totalPrice: Number(row.line_total),
      unitPrice: Number(row.cost_price),
    };
  }

  private mapRowToOrderDetails(
    row: any,
    orderItems: ProductItem[],
  ): PurchaseOrderDeatilsResponseDto {
    return {
      purchaseOrderId: row.purchase_order_id,
      purchaseOrderNumber: row.purchase_order_number,
      purchaseOrderStatus: row.purchase_order_status,
      purchaseOrderDate: row.purchase_order_date,
      purchaseOrderTotalPrice: Number(row.purchase_order_total_price),
      supplierInformation: {
        supplierName: row.supplier_name,
        supplierContactPerson: row.supplier_contact_person,
        supplierEmail: row.supplier_email,
        supplierPhone: row.supplier_phone,
        supplierAddress: row.supplier_address,
      },
      deliveryInformation: {
        wareHouseName: row.warehouse_name,
        wareHouseAddress: row.warehouse_address,
        wareHouseContactPerson: row.warehouse_contact_person,
        wareHousePhone: row.warehouse_phone,
      },
      productItems: orderItems,
    };
  }
}
