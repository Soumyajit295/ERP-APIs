import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TenantModulesService } from './tenant-modules.service';
import { ModuleOptionDto } from 'src/common/dto/tenant-modules.dto';
import { SWAGGER_BEARER_AUTH } from 'src/swagger';

@ApiTags('Tenant Modules')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('tenant-modules')
export class TenantModulesController {
    constructor(
        private readonly tenantModulesService: TenantModulesService
    ){}

    @Get('options')
    @ApiOperation({ summary: 'List all module options for the tenant' })
    @ApiOkResponse({ type: [ModuleOptionDto] })
    public async getTenantModules(){
        return await this.tenantModulesService.moduleOptions()
    }
}
