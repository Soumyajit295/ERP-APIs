import { Injectable } from '@nestjs/common';
import { TogglePermissionDto } from 'src/common/dto/permission.dto';
import { PermissionRepository } from 'src/repositories/permission.repository';

@Injectable()
export class PermissionsService {
    constructor(
        private readonly permissionRepository: PermissionRepository
    ){}

    public async validatePermission(modules: any){
        return await this.permissionRepository.validatePermissions(modules)
    }

    public async getPermissionbyModuleId(moduleId: string){
        return await this.permissionRepository.getPermissionbyModuleId(moduleId)
    }

    public async togglePermission(payload: TogglePermissionDto,roleId: string,tenantId: string){
        return await this.permissionRepository.togglePermission(payload,tenantId,roleId)
    }
}
