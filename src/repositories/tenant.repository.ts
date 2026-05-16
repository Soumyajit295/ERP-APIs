import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreateTenantDto } from "src/common/dto/createTenant.dto";
import { DatabaseService } from "src/database/database.service";
import { Tenant } from "src/entities/tenant.entity";
import { PoolClient } from "pg";

@Injectable()
export class TenantRepository {
    constructor(private readonly databaseService: DatabaseService){}
    
    async findByName(name: string, client?: PoolClient): Promise<Tenant | null>{
        const query = `
            SELECT * FROM tenants
            where company_name = $1 AND deleted_at IS NULL;
        `
        const result = client
            ? await client.query(query,[name])
            : await this.databaseService.query(query,[name])

        if(result.rows.length === 0) return null
        return this.mapRowToTenant(result.rows[0])
    }

    async createTenant(createTenantDto: CreateTenantDto, client?: PoolClient): Promise<Tenant>{
        try {
            const tenantQuery = `
                INSERT INTO tenants(company_name,city)
                values($1,$2)
                RETURNING *
            `
            const result = client
                ? await client.query(tenantQuery,[createTenantDto.companyName,createTenantDto.city])
                : await this.databaseService.query(tenantQuery,[createTenantDto.companyName,createTenantDto.city])

            const roleQuery = `
                INSERT INTO roles(tenant_id,name)
                values($1,$2)
                RETURNING *
            `
            if (client) {
                await client.query(roleQuery,[result.rows[0].id,'ADMIN'])
            } else {
                await this.databaseService.query(roleQuery,[result.rows[0].id,'ADMIN'])
            }

            return this.mapRowToTenant(result.rows[0])
    
        } catch (error) {
            throw new InternalServerErrorException(error,{description: 'Unable to register your company'})
        }
    }

    private mapRowToTenant(row: any): Tenant {
        return {
            id: row.id,
            companyName: row.company_name,
            city: row.city,
            is_active: row.is_active,
            created_at: row.created_at,
            updated_at: row.updated_at,
            deleted_at: row.deleted_at
        }
    }
}
