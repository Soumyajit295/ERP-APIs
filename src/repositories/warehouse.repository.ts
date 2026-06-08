import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedResponseDto } from 'src/common/dto/paginationResponse.dto';
import {
  CreateWarehouseDto,
  GetWarehouseParamsDto,
  InventoryProducts,
  UpdateWarehouseDto,
  WarehouseDetailResponseDto,
} from 'src/common/dto/warehouse.dto';
import { DatabaseService } from 'src/database/database.service';

export interface Warehouse {
  warehouseId: string;
  warehouseName: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  capacity?: number;
  isActive?: boolean;
}

@Injectable()
export class WarehouseRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async createWarehouse(
    createWarehouseDto: CreateWarehouseDto,
    tenantId: string,
  ) {
    try {
      const query = `
            INSERT INTO warehouses(
                tenant_id,
                warehouse_name,
                address,
                contact_person,
                phone,
                capacity
            )
            VALUES($1,$2,$3,$4,$5,$6)
            RETURNING warehouse_id
        `;

      const values = [
        tenantId,
        createWarehouseDto.warehouseName,
        createWarehouseDto.address,
        createWarehouseDto.contactPerson,
        createWarehouseDto.phone,
        createWarehouseDto.capacity,
      ];

      await this.databaseService.query(query, values);

      return { message: 'Warehouse created successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Internal server error, while creating warehouse',
      );
    }
  }

  async updatewarehouse(
    updateWarehouseDto: UpdateWarehouseDto,
    warehouseId: string,
    tenantId: string,
  ) {
    const updates: string[] = [];
    const values: any[] = [];
    let index = 1;

    const columnMap = {
      warehouseName: 'warehouse_name',
      address: 'address',
      contactPerson: 'contact_person',
      phone: 'phone',
      capacity: 'capacity',
      isActive: 'is_active',
    };

    Object.entries(updateWarehouseDto).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${columnMap[key]} = $${index}`);
        values.push(value);
        index++;
      }
    });

    if (updates.length === 0) {
      throw new BadRequestException('At least one field has to be updated');
    }

    values.push(warehouseId, tenantId);

    try {
      const query = `
            UPDATE warehouses
            SET ${updates.join(', ')}, updated_at = NOW()
            WHERE warehouse_id = $${index}
                AND tenant_id = $${index + 1}
                AND deleted_at IS NULL
            RETURNING warehouse_id
        `;

      await this.databaseService.query(query, values);

      return { message: 'Warehouse updated successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Internal server error, while updating warehouse',
      );
    }
  }

  async getPaginatedWarehouse(
    getWarehouseParamsDto: GetWarehouseParamsDto,
    tenantId: string,
  ): Promise<PaginatedResponseDto<Warehouse>> {
    const { page = 1, limit = 10, search, status } = getWarehouseParamsDto;

    const currentPage = Math.max(Number(page), 1);
    const pageLimit = Math.min(Math.max(Number(limit), 1), 100);
    const offset = (currentPage - 1) * pageLimit;
    const searchParams = search?.trim() ?? null;
    const statusParams = status ?? null;

    const countQuery = `
            SELECT COUNT(*)::INT AS total 
            FROM warehouses w
            WHERE w.tenant_id = $1
                AND w.deleted_at IS NULL
                AND(
                    $2::text IS NULL
                    OR w.warehouse_name ILIKE '%' || $2 || '%'
                )
                AND(
                    $3::boolean IS NULL
                    OR w.is_active = $3
                )
        `;

    const countValues = [tenantId, searchParams, statusParams];

    const warehouseQuery = `
            SELECT
                w.warehouse_id,
                w.warehouse_name,
                w.contact_person,
                w.phone,
                w.address,
                w.is_active,
                w.capacity
            FROM warehouses w
            WHERE w.tenant_id = $1
                AND w.deleted_at IS NULL
                AND(
                    $4::text IS NULL
                    OR w.warehouse_name ILIKE '%' || $4 || '%'
                )
                AND(
                    $5::boolean IS NULL
                    OR w.is_active = $5
                )
            ORDER BY w.created_at DESC
            LIMIT $2
            OFFSET $3
        `;

    const warehouseValues = [
      tenantId,
      pageLimit,
      offset,
      searchParams,
      statusParams,
    ];

    const [countResult, warehouseResult] = await Promise.all([
      this.databaseService.query(countQuery, countValues),
      this.databaseService.query(warehouseQuery, warehouseValues),
    ]);

    const total = countResult?.rows?.[0]?.total ?? 0;
    const totalPages = Math.ceil(total / pageLimit);

    return {
      records:
        warehouseResult?.rows?.map((row: any) => this.mapRowToWarehouse(row)) ??
        [],
      meta: {
        page: currentPage,
        limit: pageLimit,
        total,
        totalPages,
      },
    };
  }

  async getWarehouseOptions(tenantId: string) {
    try {
      const query = `
            SELECT
                w.warehouse_name AS label,
                w.warehouse_id AS value
            FROM warehouses w
            WHERE w.tenant_id = $1
                AND w.deleted_at IS NULL
        `;
      const result = await this.databaseService.query(query, [tenantId]);

      return result.rows;
    } catch (error) {
      throw new InternalServerErrorException(
        'Internal server error, while fetching warehouse options',
      );
    }
  }

  async deleteWarehouse(warehouseId: string, tenantId: string) {
    try {
      const query = `
            UPDATE warehouses
            SET deleted_at = NOW()
            WHERE warehouse_id = $1
                AND tenant_id = $2
                AND deleted_at IS NULL
        `;

      await this.databaseService.query(query, [warehouseId, tenantId]);

      return { message: 'Warehouse deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Internal server error, while deleting warehouse',
      );
    }
  }

  async getWarehouseDetails(
    warehouseId: string,
    tenantId: string,
  ): Promise<WarehouseDetailResponseDto> {
    try {
      const warehouseQuery = `
        SELECT 
          w.warehouse_id,
          w.warehouse_name,
          w.address,
          w.phone,
          w.contact_person,
          w.created_at,
          w.capacity,
          w.is_active
        FROM warehouses w
        WHERE w.warehouse_id = $1
        AND w.tenant_id = $2
        AND w.deleted_at IS NULL
      `;

      const warehouseResult = await this.databaseService.query(warehouseQuery, [
        warehouseId,
        tenantId,
      ]);

      if (warehouseResult.rows.length === 0) {
        throw new NotFoundException('Warehouse not found');
      }

      const inventoryProductsQuery = `
        SELECT 
          p.product_name,
          p.sku AS product_sku,
          i.quantity,
          i.reserved_quantity,
          i.last_restock_date
        FROM inventory i
        JOIN products p ON p.product_id = i.product_id AND p.deleted_at IS NULL
        WHERE i.warehouse_id = $1
              AND i.tenant_id = $2
      `;

      const inventoryResult = await this.databaseService.query(
        inventoryProductsQuery,
        [warehouseId, tenantId],
      );

      const inventoryProducts =
        inventoryResult?.rows?.map((row: any) =>
          this.mapRowToInventoryProduct(row),
        ) ?? [];

      return this.mapRowToInventoryDetail(
        warehouseResult.rows[0],
        inventoryProducts,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Internal server error while fetching warehouse details',
      );
    }
  }
  private mapRowToWarehouse(row: any): Warehouse {
    return {
      warehouseId: row.warehouse_id,
      warehouseName: row.warehouse_name,
      address: row.address,
      contactPerson: row.contact_person,
      phone: row.phone,
      capacity:
        row.capacity === null || row.capacity === undefined
          ? undefined
          : Number(row.capacity),
      isActive: row.is_active,
    };
  }

  private mapRowToInventoryProduct(row: any): InventoryProducts {
    return {
      productName: row.product_name,
      productSku: row.product_sku,
      productQuantity: Number(row.quantity),
      reservedProductQuantity: Number(row.reserved_quantity),
      lastUpdated: row.last_restock_date,
    };
  }

  private mapRowToInventoryDetail(
    row: any,
    inventoryProducts: InventoryProducts[],
  ): WarehouseDetailResponseDto {
    return {
      warehouseId: row.warehouse_id,
      warehouseName: row.warehouse_name,
      warehouseStatus: row.is_active,
      warehouseCapacity: row.capacity,
      addressInformation: {
        warehouseAddress: row.address,
        warehouseCreatedAt: row.created_at,
      },
      contactInformation: {
        warehouseContactPerson: row.contact_person,
        warehousePhone: row.phone,
      },
      inventoryItems: inventoryProducts,
      totalProducts: inventoryProducts.length,
      totalReserved: inventoryProducts.reduce(
        (acc, curr) => acc + (curr.reservedProductQuantity ?? 0),
        0,
      ),
      unitsOnHand: inventoryProducts.reduce(
        (acc, curr) => acc + (curr.productQuantity ?? 0),
        0,
      ),
    };
  }
}
