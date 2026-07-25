import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { PoolClient } from "pg";

@Injectable()
export class PermissionRepository {
    constructor(
        private readonly databaseService: DatabaseService
    ){}
    async giveAllModulePermissionToAdminForTenant(adminId: string,tenantId: string, client?: PoolClient){
        try {
            const query = `
                INSERT INTO role_permissions(role_id,per_id,tenant_id)
                SELECT
                    $2 as role_id,
                    p.permission_id as per_id,
                    $1 as tenant_id
                FROM permissions p
                WHERE p.deleted_at IS NULL
                ON CONFLICT (role_id, per_id, tenant_id) DO NOTHING
            `;
            return client
                ? await client.query(query,[tenantId,adminId])
                : await this.databaseService.query(query,[tenantId,adminId])
        } catch (error) {
            throw new InternalServerErrorException(error,'Failed to give admin permissions')
        }   
    }

    async getAllPermissionForUser(userId: string){
        try {
            const query = `
                SELECT 
                    m.module_name,
                    p.permission_name
                FROM users u
                JOIN role_permissions rp on rp.role_id = u.role_id
                JOIN permissions p on p.permission_id = rp.per_id
                JOIN modules m on m.module_id = p.module_id
                WHERE u.id = $1
                    AND rp.tenant_id = u.tenant_id
                    AND rp.deleted_at IS NULL
                    AND p.deleted_at IS NULL
                    AND m.deleted_at IS NULL
                ORDER BY
                    m.module_name,
                    p.permission_name
            `;

            const result = await this.databaseService.query(query,[userId])

            if(result.rows.length === 0) return [];

            return result.rows.map((row) => `${row.module_name.toLowerCase()}_${row.permission_name.toLowerCase()}`)
        } catch (error) {
            throw new InternalServerErrorException('Internal server error')
        }
    }

    async validatePermissions(modules: any,client?: any) {
        try {
            for(const mod of modules){
                const validationQuery = `
                    SELECT COUNT(*) = $1 AS is_valid
                    FROM permissions p
                    WHERE p.module_id = $2
                        AND p.permission_id = ANY($3::uuid[])
                        AND p.deleted_at IS NULL 
                `;

                const datasource = client ? client : this.databaseService

                const result = await datasource.query(validationQuery,[mod.permissions.length,mod.moduleId,mod.permissions])

                if(!result?.rows[0]?.is_valid) return false
            }

            return true
        } catch (error) {
            throw new InternalServerErrorException('Internal server error, while validating permissions')
        }
    }

    async getPermissionbyModuleId(moduleId: string){
        try {
            const query = `
                SELECT 
                    p.permission_name AS label,
                    p.permission_id AS value
                FROM permissions p
                WHERE p.module_id = $1
                AND p.deleted_at IS NULL
            `;

            const result = await this.databaseService.query(query,[moduleId])

            return result?.rows
        } catch (error) {
            throw new InternalServerErrorException('Internal server error, while fetching permissions')
        }
    }
}
