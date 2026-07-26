import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { PoolClient } from "pg";
import { TogglePermissionDto } from "src/common/dto/permission.dto";
import { TogglePermission } from "src/common/enums/permission.enum";

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

    async togglePermission(payload: TogglePermissionDto,tenantId: string,roleId: string){
        try {
            const {action,permissionId} = payload

            if(action === TogglePermission.ASSIGN){
                const query = `
                    SELECT rp.rp_id FROM role_permissions rp
                    WHERE rp.tenant_id = $1
                    AND rp.role_id = $2
                    AND rp.per_id = $3
                    AND rp.deleted_at IS NULL
                `;

                const result = await this.databaseService.query(query,[tenantId,roleId,permissionId])

                if(result?.rows?.length > 0){
                    return {message: 'Permission already assigned'}
                }

                const softDeleteQuery = `
                    SELECT rp.rp_id FROM role_permissions rp
                    WHERE rp.tenant_id = $1
                    AND rp.role_id = $2
                    AND rp.per_id = $3
                    AND rp.deleted_at IS NOT NULL
                `;

                const softDeleteResult = await this.databaseService.query(softDeleteQuery,[tenantId,roleId,permissionId])

                if(softDeleteResult?.rows?.length > 0){
                    const query = `
                        UPDATE role_permissions
                        SET deleted_at = NULL
                        WHERE rp_id = $1
                        AND tenant_id = $2
                    `;

                    await this.databaseService.query(query,[softDeleteResult?.rows[0]?.rp_id,tenantId])

                    return {message: 'Permission reactivated successfully'}
                } else {
                    const query = `
                        INSERT INTO role_permissions(role_id,per_id,tenant_id)
                        VALUES($1,$2,$3)
                        RETURNING rp_id
                    `;

                    const result = await this.databaseService.query(query,[roleId,permissionId,tenantId])

                    if(result?.rows?.length > 0){
                        return {message: 'Permission assigned successfully'}
                    }

                    return {message: 'Failed to assign permission'}
                }
            } else {
                const query = `
                    UPDATE role_permissions
                    SET deleted_at = NOW()
                    WHERE tenant_id = $1
                    AND role_id = $2
                    AND per_id = $3
                    AND deleted_at IS NULL
                    RETURNING rp_id
                `;
                const result = await this.databaseService.query(query,[tenantId,roleId,permissionId])

                if(result?.rows?.length > 0){
                    return {message: 'Permission removed successfully'}
                }

                return {message: 'Permission not found or already removed'}
            }
        } catch (error) {
            throw new InternalServerErrorException(`Internal server error , while toggling the permission`)
        }
    }
}
