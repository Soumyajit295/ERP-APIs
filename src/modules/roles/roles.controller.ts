import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CurrentUser } from '../auth/currentuser.decorator';
import type { CurrentUserPayload } from '../auth/types/current-user.type';
import { CreateRolesDto } from 'src/common/dto/createRole.dto';
import { PERMISSION_CODES } from 'src/common/constants/permissions.constant';
import { Permissions } from '../auth/permissions.decorator';
import { SWAGGER_BEARER_AUTH } from 'src/swagger';

@ApiTags('Roles')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('roles')
export class RolesController {
    constructor(
        private readonly rolesService: RolesService
    ){}
    @Get()
    @ApiOperation({ summary: 'List roles in the authenticated tenant' })
    public async getRole(
        @CurrentUser() user: CurrentUserPayload
    ){
        return await this.rolesService.getRolesByTenantID(user.tenantId)
    }

    @Post()
    @Permissions(PERMISSION_CODES.USER_CREATE)
    @ApiOperation({ summary: 'Create a role in the authenticated tenant' })
    public async createRole(
        @CurrentUser() user: CurrentUserPayload,
        @Body() createRoleDto: CreateRolesDto
    ){
        return await this.rolesService.createRole(user.tenantId,createRoleDto)
    }

    @Delete(':id')
    @ApiParam({ name: 'id', format: 'uuid' })
    @ApiOperation({ summary: 'Delete a role' })
    public async deleteRole(
        @CurrentUser() user: CurrentUserPayload,
        @Param('id', ParseUUIDPipe) id: string
    ){
        return await this.rolesService.deleteRole(id)
    }
}
