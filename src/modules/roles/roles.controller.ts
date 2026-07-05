import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CurrentUser } from '../auth/currentuser.decorator';
import type { CurrentUserPayload } from '../auth/types/current-user.type';
import { CreateRolesDto } from 'src/common/dto/createRole.dto';
import { RoleOptionDto } from 'src/common/dto/roleOption.dto';
import { PERMISSION_CODES } from 'src/common/constants/permissions.constant';
import { Permissions } from '../auth/permissions.decorator';
import { SWAGGER_BEARER_AUTH } from 'src/swagger';
import { GetPermissionQueryDto } from 'src/common/dto/role-permissions.dto';

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

    @Get('options')
    @ApiOperation({ summary: 'role options in the authenticated tenant' })
    @ApiOkResponse({ type: [RoleOptionDto] })
    public async roleOptions(@CurrentUser('tenantId') tenantId: string){
        return await this.rolesService.getRoleOptions(tenantId)
    }

    @Get('role-permissions/:roleId')
    @ApiOperation({ summary: 'All permission of given role in authenticated tenant' })
    public async getAllPermissionForRole(
        @CurrentUser('tenantId') tenantId: string,
        @Query() getPermissionsQueryDto: GetPermissionQueryDto,
        @Param('roleId',ParseUUIDPipe) roleId: string
    ){
        return await this.rolesService.getAllPermissionsOfRole(getPermissionsQueryDto,tenantId,roleId)
    }
}
