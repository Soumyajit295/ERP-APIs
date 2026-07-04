import { Injectable } from '@nestjs/common';
import { CreateRolesDto } from 'src/common/dto/createRole.dto';
import { RolesRepository } from 'src/repositories/role.repository';

@Injectable()
export class RolesService {
    constructor(
        private readonly rolesRepository: RolesRepository
    ){}

    public async getRolesByTenantID(tenantId: string){
        return await this.rolesRepository.getRolesByTenantId(tenantId)
    }

    public async createRole(tenantId: string,createRoleDto: CreateRolesDto){
        return await this.rolesRepository.createRole(tenantId,createRoleDto)
    }

    public async deleteRole(roleId: string){
        return await this.rolesRepository.deleteRole(roleId)
    }

    public async getRoleOptions(tenantId: string){
        return await this.rolesRepository.getRoleOptions(tenantId)
    }
}
