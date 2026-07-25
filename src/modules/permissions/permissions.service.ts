import { Injectable } from '@nestjs/common';
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
}
