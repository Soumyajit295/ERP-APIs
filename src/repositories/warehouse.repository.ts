import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PaginatedResponseDto } from 'src/common/dto/paginationResponse.dto';
import {
  CreateWarehouseDto,
  GetWarehouseParamsDto,
  UpdateWarehouseDto,
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
        warehouseResult?.rows?.map((row: any) => this.mapRowToWarehouse(row)) ?? [],
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
}
