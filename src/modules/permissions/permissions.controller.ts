import { Body, Controller, Get, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { PermissionOptionDto } from 'src/common/dto/tenant-modules.dto';
import { SWAGGER_BEARER_AUTH } from 'src/swagger';
import { TogglePermissionDto } from 'src/common/dto/permission.dto';
import { CurrentUser } from '../auth/currentuser.decorator';

class TogglePermissionResponseDto {
    message!: string;
}

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

    @Patch(':roleId/toggle-permission')
    @ApiOperation({ summary: 'Toggle permission of associated role' })
    @ApiParam({ name: 'roleId', format: 'uuid', description: 'Select role id' })
    @ApiOkResponse({ type: TogglePermissionResponseDto })
    public async togglePermission(
        @Body() payload: TogglePermissionDto,
        @Param('roleId',ParseUUIDPipe) roleId: string,
        @CurrentUser('tenantId') tenantId: string
    ){
        return await this.permissionService.togglePermission(payload,roleId,tenantId)
    }
}
