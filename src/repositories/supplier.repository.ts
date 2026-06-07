import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PaginatedResponseDto } from 'src/common/dto/paginationResponse.dto';
import {
  CreateSupplierDto,
  GetSupplierParamsDto,
  PurchaseOrderDto,
  SupplierDetailsResponseDto,
  SupplierPaginatedResponseDto,
  UpdateSupplierDto,
} from 'src/common/dto/supplier.dto';
import { PurchaseOrderStatus } from 'src/common/enums/purchase-order.enum';
import { DatabaseService } from 'src/database/database.service';

export interface Supplier {
  supplierId: string;
  supplierName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  isActive?: boolean;
  totalOrders?: number;
}

@Injectable()
export class SupplierRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async createSupplier(createSupplierDto: CreateSupplierDto, tenantId: string) {
    try {
      const query = `
            INSERT INTO suppliers(
                tenant_id,
                supplier_name,
                email,
                phone,
                contact_person,
                address,
                tax_number
            )
            VALUES($1,$2,$3,$4,$5,$6,$7)
            RETURNING supplier_id
        `;
      const values = [
        tenantId,
        createSupplierDto.supplierName,
        createSupplierDto.email,
        createSupplierDto.phone,
        createSupplierDto.contactPerson,
        createSupplierDto.address,
        createSupplierDto.taxNumber,
      ];

      await this.databaseService.query(query, values);

      return { message: 'Supplier created successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Internal server error, while creating supplier',
      );
    }
  }

  async paginatedSupplier(
    getSupplierParamDto: GetSupplierParamsDto,
    tenantId: string,
  ): Promise<SupplierPaginatedResponseDto> {
    const { page = 1, limit = 10, search, status } = getSupplierParamDto;

    const currentPage = Math.max(Number(page), 1);
    const pageLimit = Math.min(Math.max(Number(limit), 1), 100);
    const offset = (currentPage - 1) * pageLimit;
    const searchParams = search?.trim() ?? null;
    const statusParams = status ?? null;

    try {
      const countQuery = `
            SELECT COUNT(*)::int AS total
            FROM suppliers s
            WHERE s.tenant_id = $1
                AND s.deleted_at IS NULL
                AND(
                    $2::text IS NULL 
                    OR s.supplier_name ILIKE '%' || $2 || '%'
                )
                AND(
                    $3::boolean IS NULL
                    OR s.is_active = $3
                )
        
        `;

      const countValues = [tenantId, searchParams, statusParams];

      const supplierQuery = `
            SELECT
                s.supplier_id,
                s.supplier_name,
                s.email,
                s.phone,
                s.contact_person,
                s.address,
                s.tax_number,
                s.is_active,
                (
                  SELECT COUNT(*)::INT
                  FROM purchase_orders po
                  WHERE po.supplier_id = s.supplier_id AND po.deleted_at IS NULL
                ) AS total_orders
            FROM suppliers s
            WHERE s.tenant_id = $1
                AND s.deleted_at IS NULL
                AND(
                    $4::text IS NULL 
                    OR s.supplier_name ILIKE '%' || $4 || '%'
                )
                AND(
                    $5::boolean IS NULL
                    OR s.is_active = $5
                )
            ORDER BY s.created_at DESC
            LIMIT $2
            OFFSET $3
        `;

      const supplierValues = [
        tenantId,
        pageLimit,
        offset,
        searchParams,
        statusParams,
      ];

      const [countResult, supplierResult] = await Promise.all([
        this.databaseService.query(countQuery, countValues),
        this.databaseService.query(supplierQuery, supplierValues),
      ]);

      const total = countResult?.rows?.[0]?.total ?? 0;
      const totalPages = Math.ceil(total / pageLimit);

      return {
        records:
          supplierResult?.rows?.map((row: any) => this.mapRowToSupplier(row)) ??
          [],
        meta: {
          page: currentPage,
          limit: pageLimit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Internal server error, while fetching suppliers',
      );
    }
  }

  async getSuppliersOptions(tenantId: string) {
    try {
      const query = `
            SELECT
                s.supplier_name AS label,
                s.supplier_id AS value
            FROM suppliers s
            WHERE s.tenant_id = $1
                AND s.deleted_at IS NULL
        `;
      const result = await this.databaseService.query(query, [tenantId]);

      return result.rows;
    } catch (error) {
      throw new InternalServerErrorException(
        'Internal server error, while fetching supplier options',
      );
    }
  }

  async updateSupplier(
    updateSupplierDto: UpdateSupplierDto,
    supplierId: string,
    tenantId: string,
  ) {
    const updates: string[] = [];
    const values: any[] = [];
    let index = 1;

    const {
      supplierName,
      email,
      phone,
      address,
      contactPerson,
      isActive,
      taxNumber,
    } = updateSupplierDto;

    const columnMap = {
      supplierName: 'supplier_name',
      email: 'email',
      phone: 'phone',
      address: 'address',
      contactPerson: 'contact_person',
      isActive: 'is_active',
      taxNumber: 'tax_number',
    };

    Object.entries(updateSupplierDto).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${columnMap[key]} = $${index}`);
        values.push(value);
        index++;
      }
    });

    values.push(supplierId, tenantId);

    if (updates.length === 0) {
      throw new BadRequestException('Atlease one field has to be updated');
    }

    try {
      const query = `
            UPDATE suppliers s
            SET ${updates.join(', ')} , updated_at = NOW()
            WHERE s.supplier_id = $${index}
                AND s.tenant_id = $${index + 1}
                AND s.deleted_at IS NULL
                RETURNING s.supplier_id
        `;

      await this.databaseService.query(query, values);

      return { message: 'Supplier updated successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Internal server error, while update supplier',
      );
    }
  }

  async deleteSupplier(supplierId: string, tenantId: string) {
    try {
      const query = `
            UPDATE suppliers s
            SET deleted_at = NOW()
            WHERE s.supplier_id = $1
                AND s.tenant_id = $2
                AND s.deleted_at IS NULL
        `;

      await this.databaseService.query(query, [supplierId, tenantId]);

      return { message: 'Supplier deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Internal server error, while deleting supplier',
      );
    }
  }

  async getSupplierDetails(
    supplierId: string,
    tenantId: string,
  ): Promise<SupplierDetailsResponseDto | null> {
    try {
      const supplierQuery = `
        SELECT 
          s.supplier_id,
          s.supplier_name,
          s.contact_person,
          s.phone,
          s.email,
          s.address,
          s.is_active,
          (
            SELECT COUNT(*)::INT
            FROM purchase_orders po
            WHERE po.supplier_id = $1
              AND po.tenant_id = $2
              AND po.deleted_at IS NULL
          ) AS total_order,
          (
            SELECT
              COALESCE(SUM(poi.line_total), 0)::float
            FROM purchase_orders po
            JOIN purchase_order_items poi ON poi.po_id = po.po_id
            WHERE po.supplier_id = $1
              AND po.tenant_id = $2
              AND po.deleted_at IS NULL
              AND po.status = $3
          ) AS total_spent

        FROM suppliers s
        WHERE s.supplier_id = $1
          AND s.tenant_id = $2
          AND s.deleted_at IS NULL
      `;

      const supplierValues = [
        supplierId,
        tenantId,
        PurchaseOrderStatus.RECEIVED,
      ];

      const lastThreePurchaseOrderQuery = `
        SELECT 
          po.po_id AS purchase_order_id,
          po.po_number AS purchase_order_number,
          po.status AS order_status,
          po.order_date AS order_date,
          (
            SELECT COALESCE(SUM(poi.line_total), 0)::float
            FROM purchase_order_items poi
            WHERE poi.po_id = po.po_id
          ) AS total_amount
        FROM purchase_orders po
        WHERE po.supplier_id = $1
          AND po.tenant_id = $2
          AND po.deleted_at IS NULL
        ORDER BY po.created_at DESC
        LIMIT 3
      `;

      const lastThreePurchaseOrderValues = [supplierId, tenantId];

      const [supplierResult, purchaseOrderResult] = await Promise.all([
        this.databaseService.query(supplierQuery, supplierValues),
        this.databaseService.query(
          lastThreePurchaseOrderQuery,
          lastThreePurchaseOrderValues,
        ),
      ]);

      if (supplierResult.rows.length === 0) return null;

      return this.mapRowToSupplierDetails(
        supplierResult.rows[0],
        purchaseOrderResult?.rows ?? [],
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Internal server error, while fetching supplier details',
      );
    }
  }

  private mapRowToSupplier(row: any): Supplier {
    return {
      supplierId: row.supplier_id,
      supplierName: row.supplier_name,
      contactPerson: row.contact_person,
      email: row.email,
      phone: row.phone,
      address: row.address,
      taxNumber: row.tax_number,
      isActive: row.is_active,
      totalOrders: row.total_orders,
    };
  }

  private mapRowToSupplierDetails(
    row: any,
    purchaseOrders: any[],
  ): SupplierDetailsResponseDto {
    return {
      supplierId: row.supplier_id,
      supplierName: row.supplier_name,
      supplierStatus: row.is_active,
      totalOrders: row.total_order,
      totalSpents: row.total_spent,
      contactInformation: {
        supplierContactPerson: row.contact_person,
        supplierPhone: row.phone,
        supplierEmail: row.email,
        supplierAddress: row.address,
      },
      latestPurchaseOrders: purchaseOrders.map((purchaseOrder) => ({
        purchaseOrderId: purchaseOrder.purchase_order_id,
        purchaseOrderNumber: purchaseOrder.purchase_order_number,
        orderStatus: purchaseOrder.order_status,
        orderDate: purchaseOrder.order_date,
        totalAmount: Number(purchaseOrder.total_amount),
      })),
    };
  }
}
