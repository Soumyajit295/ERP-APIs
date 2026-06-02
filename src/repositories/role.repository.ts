import { BadRequestException, Injectable, InternalServerErrorException, Query } from "@nestjs/common";
import { CreateRolesDto } from "src/common/dto/createRole.dto";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class RolesRepository {
    constructor(
        private readonly databaseService: DatabaseService
    ){}
    async getRolesByTenantId(tenantId: string){
        try {
            const query = `
                SELECT * FROM roles r
                WHERE r.tenant_id = $1 AND r.deleted_at IS null
                ORDER BY r.created_at ASC
            `;

            const result = await this.databaseService.query(query,[tenantId])

            if(result.rows.length === 0) return null

            return result.rows.map(role => this.mapRowToRoles(role))

        } catch (error) {
            throw new InternalServerErrorException('Internal server error, Failed to fetch roles')
        }
    }

    async createRole(tenantId: string, createRoleDto: CreateRolesDto){
        try {
            const moduleIds = [...new Set(createRoleDto.moduleIds ?? [])]

            return await this.databaseService.transaction(async (client) => {
                const roleQuery = `
                    INSERT INTO roles(tenant_id,name)
                    VALUES($1,$2)
                    RETURNING *
                `
                const roleResult = await client.query(roleQuery,[tenantId,createRoleDto.roleName])

                if(roleResult.rows.length === 0) return null

                const role = roleResult.rows[0]

                if(moduleIds.length > 0){
                    const moduleQuery = `
                        INSERT INTO role_permissions(role_id,per_id,tenant_id)
                        SELECT
                            $1 AS role_id,
                            p.permission_id AS per_id,
                            $2 AS tenant_id
                        FROM permissions p
                        WHERE p.module_id = ANY($3::UUID[]) AND p.deleted_at IS NULL            
                    `;

                    await client.query(moduleQuery,[role.id,tenantId,moduleIds])
                }
                return role;       
            })
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error
            }
            console.log(error)
            throw new InternalServerErrorException('Internal server error, unable to create role')
        }
    }

    async deleteRole(roleId: string){
        try {
            const query = `
                SELECT * FROM roles r
                WHERE r.id = $1
            `;

            const result = await this.databaseService.query(query,[roleId])

            if(result.rows.length === 0) return null

            if(result.rows[0].name === 'ADMIN'){
                throw new BadRequestException('ADMIN role cannot be deleted')
            }

            const deleteQuery = `
                UPDATE roles r
                SET deleted_at = NOW()
                WHERE r.id = $1
                RETURNING *
            `;

            const deleteQueryResult = await this.databaseService.query(query,[roleId])

            return this.mapRowToRoles(deleteQueryResult.rows[0])

        } catch (error) {
            if(error instanceof BadRequestException){
                throw error
            }
            throw new InternalServerErrorException('Internal server error, failed to delete role')
        }
    }

    private mapRowToRoles(row: any){
        return{
            roleId: row.id,
            roleName: row.name,
            status: row.is_active
        }
    }
}
