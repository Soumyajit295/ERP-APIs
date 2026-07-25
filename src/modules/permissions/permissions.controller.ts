import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { PermissionOptionDto } from 'src/common/dto/tenant-modules.dto';
import { SWAGGER_BEARER_AUTH } from 'src/swagger';

@ApiTags('Permissions')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('permissions')
export class PermissionsController {
    constructor(
        private readonly permissionService: PermissionsService
    ){}

    @Get(':moduleId')
    @ApiOperation({ summary: 'List permission options for a given module' })
    @ApiParam({ name: 'moduleId', format: 'uuid', description: 'The module ID to fetch permissions for' })
    @ApiOkResponse({ type: [PermissionOptionDto] })
    public async getPermissionbyModuleId(@Param('moduleId',ParseUUIDPipe) moduleId: string){
        return await this.permissionService.getPermissionbyModuleId(moduleId)
    }
}
