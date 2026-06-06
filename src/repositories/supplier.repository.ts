import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PaginatedResponseDto } from 'src/common/dto/paginationResponse.dto';
import {
  CreateSupplierDto,
  GetSupplierParamsDto,
  SupplierPaginatedResponseDto,
  UpdateSupplierDto,
} from 'src/common/dto/supplier.dto';
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
                s.is_active
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
    };
  }
}
