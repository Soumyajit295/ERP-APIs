import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/common/dto/createUser.dto';
import { CurrentUser } from '../auth/currentuser.decorator';
import type { CurrentUserPayload } from '../auth/types/current-user.type';
import { UpdateUserDto } from 'src/common/dto/updateUser.dto';
import { PERMISSION_CODES } from 'src/common/constants/permissions.constant';
import { Permissions } from '../auth/permissions.decorator';

@Controller('users')
export class UsersController {
    constructor(
        private readonly userService: UsersService
    ){}

    @Post()
    @Permissions(PERMISSION_CODES.USER_CREATE)
    public async createUser(
        @Body() createUserDto: CreateUserDto,
        @CurrentUser() user: CurrentUserPayload
    ){
        return await this.userService.createUser(createUserDto,user.tenantId)
    }

    @Get()
    @Permissions(PERMISSION_CODES.USER_READ)
    public async getTenantUsers(
        @CurrentUser() user: CurrentUserPayload
    ){
        return await this.userService.getTenantUsers(user.tenantId)
    }

    @Patch(':userId')
    @Permissions(PERMISSION_CODES.USER_MODIFY)
    public async updateUser(
        @Body() updateUserDto: UpdateUserDto,
        @Param('userId', ParseUUIDPipe) userId: string
    ){
        return await this.userService.updateUser(updateUserDto,userId)
    }

    @Delete(':userId')
    @Permissions(PERMISSION_CODES.USER_MODIFY)
    public async deleteUser(
        @Param('userId', ParseUUIDPipe) userId: string
    ){
        return await this.userService.deleteUser(userId)
    }
}
