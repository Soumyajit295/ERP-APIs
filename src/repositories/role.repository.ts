import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
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
            const query = `
                INSERT INTO ROLES(tenant_id,name)
                VALUES($1,$2)
                RETURNING *
            `;

            const result = await this.databaseService.query(query,[tenantId,createRoleDto.roleName])

            if(result.rows.length === 0) return null;

            return this.mapRowToRoles(result.rows[0])
        } catch (error) {
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