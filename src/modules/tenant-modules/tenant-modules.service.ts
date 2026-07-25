import { Injectable } from '@nestjs/common';
import { ModuleRepository } from 'src/repositories/module.repository';

@Injectable()
export class TenantModulesService {
    constructor(
        private readonly moduleRepository: ModuleRepository
    ){}

    public async moduleOptions(){
        return await this.moduleRepository.getTenantModules()
    }
}
