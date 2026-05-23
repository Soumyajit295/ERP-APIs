import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CurrentUser } from '../auth/currentuser.decorator';
import type { CurrentUserPayload } from '../auth/types/current-user.type';
import { CreateRolesDto } from 'src/common/dto/createRole.dto';

@Controller('roles')
export class RolesController {
    constructor(
        private readonly rolesService: RolesService
    ){}
    @Get()
    public async getRole(
        @CurrentUser() user: CurrentUserPayload
    ){
        return await this.rolesService.getRolesByTenantID(user.tenantId)
    }

    @Post()
    public async createRole(
        @CurrentUser() user: CurrentUserPayload,
        @Body() createRoleDto: CreateRolesDto
    ){
        return await this.rolesService.createRole(user.tenantId,createRoleDto)
    }

    @Delete(':id')
    public async deleteRole(
        @CurrentUser() user: CurrentUserPayload,
        @Param('id', ParseUUIDPipe) id: string
    ){
        return await this.rolesService.deleteRole(id)
    }
}
