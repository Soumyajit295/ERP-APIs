import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  CreateCustomerDto,
  CustomerListResponseDto,
  CustomerOptionDto,
  CustomerResponse,
  GetCustomerQueryDto,
  UpdateCustomerDto,
} from 'src/common/dto/customer.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class CustomerRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async createCustomer(createCustomerDto: CreateCustomerDto, tenantId: string) {
    try {
      const customerQuery = `
                INSERT INTO customers (
                    tenant_id,
                    customer_name,
                    email,
                    phone,
                    city,
                    address,
                    is_active
                )
                VALUES($1,$2,$3,$4,$5,$6,$7)
                RETURNING customer_id
            `;

      const customerValues = [
        tenantId,
        createCustomerDto.customerName,
        createCustomerDto.email,
        createCustomerDto.phone,
        createCustomerDto.city,
        createCustomerDto.address,
        createCustomerDto.isActive ?? true,
      ];

      await this.databaseService.query(customerQuery, customerValues);

      return { message: 'Customer created successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Internal server error while creating customer',
      );
    }
  }

  async getPaginatedCustomer(
    getCustomerQueryDto: GetCustomerQueryDto,
    tenantId: string,
  ): Promise<CustomerListResponseDto> {
    try {
      const { page = 1, limit = 10, search, status } = getCustomerQueryDto;

      const currentPage = Math.max(Number(page), 1);
      const pageLimit = Math.min(Math.max(Number(limit), 1), 100);
      const offset = (currentPage - 1) * pageLimit;
      const searchParams = search?.trim() ?? null;
      const statusParam = status ?? null;

      const countQuery = `
                SELECT COUNT(*)::INT AS total
                FROM customers c
                WHERE c.tenant_id = $1
                    AND c.deleted_at IS NULL
                    AND (
                        $2::text IS NULL
                        OR c.customer_name ILIKE '%' || $2 || '%'
                    )
                    AND (
                        $3::boolean IS NULL
                        OR c.is_active = $3
                    )
            `;

      const countValues = [tenantId, searchParams, statusParam];

      const customerQuery = `
                SELECT
                    c.customer_id,
                    c.customer_name,
                    c.email,
                    c.phone,
                    c.city,
                    c.address,
                    c.is_active
                FROM customers c
                WHERE c.tenant_id = $1
                    AND c.deleted_at IS NULL
                    AND (
                        $4::text IS NULL
                        OR c.customer_name ILIKE '%' || $4 || '%'
                    )
                    AND (
                        $5::boolean IS NULL
                        OR c.is_active = $5
                    )
                ORDER BY c.created_at DESC
                LIMIT $2
                OFFSET $3
            `;

      const customerValues = [
        tenantId,
        pageLimit,
        offset,
        searchParams,
        statusParam,
      ];

      const [countResult, customerResult] = await Promise.all([
        this.databaseService.query(countQuery, countValues),
        this.databaseService.query(customerQuery, customerValues),
      ]);

      const total = countResult?.rows[0]?.total ?? 0;
      const totalPages = Math.ceil(total / pageLimit) ?? 0;

      return {
        records: customerResult?.rows?.map((row: any) =>
          this.mapRowToCustomer(row),
        ),
        meta: {
          page: currentPage,
          limit: pageLimit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      console.error(error)
      throw new InternalServerErrorException(
        'Internal server error while fetching customers',
      );
    }
  }

  async updateCustomer(
    updateCustomerDto: UpdateCustomerDto,
    customerId: string,
    tenantId: string,
  ) {
    const updates: string[] = [];
    const values: any[] = [];
    let index = 1;

    const columnMap = {
      customerName: 'customer_name',
      email: 'email',
      phone: 'phone',
      city: 'city',
      address: 'address',
      isActive: 'is_active',
    };

    Object.entries(updateCustomerDto)?.forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${columnMap[key]} = $${index}`);
        values.push(value);
        index++;
      }
    });

    if (updates.length === 0) {
      throw new BadRequestException('At least one field has to be updated');
    }

    values.push(customerId, tenantId);

    try {
      const updateQuery = `
                UPDATE customers c
                SET ${updates.join(', ')}, updated_at = NOW()
                WHERE c.customer_id = $${index}
                    AND c.tenant_id = $${index + 1}
                    AND c.deleted_at IS NULL
                RETURNING c.customer_id
            `;

      await this.databaseService.query(updateQuery, values);

      return { message: 'Customer updated successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Internal server error while updating customer',
      );
    }
  }

  async deletedCustomer(customerId: string, tenantId: string) {
    try {
      const deleteQuery = `
                UPDATE customers c
                SET deleted_at = NOW()
                WHERE c.customer_id = $1
                AND c.tenant_id = $2
                AND c.deleted_at IS NULL
            `;

      await this.databaseService.query(deleteQuery, [customerId, tenantId]);

      return { message: 'Customer deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'internal server error while deleting customer',
      );
    }
  }

  async getCustomerById(customerId: string,tenantId: string){
    try {
      const customerQuery = `
        SELECT 
          c.customer_id
        FROM customers c
        WHERE c.customer_id = $1
          AND c.tenant_id = $2
          AND c.deleted_at IS NULL
      `;

      const customerValues = [customerId,tenantId]

      const customerResult = await this.databaseService.query(customerQuery,customerValues)

      if(customerResult?.rows?.length === 0) return null

      return customerResult.rows[0]?.customer_id
    } catch (error) {
      throw new InternalServerErrorException('Internal server error, while fetching customer')
    }
  }

  async getCustomerOptions(tenantId: string): Promise<CustomerOptionDto[]>{
    try {
      const query = `
        SELECT 
          c.customer_id,
          c.customer_name
        FROM customers c
        WHERE c.tenant_id = $1
        AND c.deleted_at IS NULL
      `;

      const result = await this.databaseService.query(query,[tenantId])

      const options = result?.rows?.map((row: any) => {
        return {
          label: row.customer_name,
          value: row.customer_id
        }
      })

      return options

    } catch (error) {
      throw new InternalServerErrorException('Internal server error, while fetching customers')
    }
  }

  private mapRowToCustomer(row: any): CustomerResponse {
    return {
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerCity: row.city,
      customerEmail: row.email,
      customerPhone: row.phone,
      customerStatus: row.is_active,
    };
  }
}
