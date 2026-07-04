import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/common/dto/createUser.dto';
import { CurrentUser } from '../auth/currentuser.decorator';
import type { CurrentUserPayload } from '../auth/types/current-user.type';
import { UpdateUserDto } from 'src/common/dto/updateUser.dto';
import { GetUsersQueryDto, UserListResponseDto } from 'src/common/dto/user.dto';
import { PERMISSION_CODES } from 'src/common/constants/permissions.constant';
import { Permissions } from '../auth/permissions.decorator';
import { SWAGGER_BEARER_AUTH } from 'src/swagger';

@ApiTags('Users')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('users')
export class UsersController {
    constructor(
        private readonly userService: UsersService
    ){}

    @Post()
    @Permissions(PERMISSION_CODES.USER_CREATE)
    @ApiOperation({ summary: 'Create a user in the authenticated tenant' })
    public async createUser(
        @Body() createUserDto: CreateUserDto,
        @CurrentUser() user: CurrentUserPayload
    ){
        return await this.userService.createUser(createUserDto,user.tenantId)
    }

    @Get()
    @Permissions(PERMISSION_CODES.USER_READ)
    @ApiOperation({ summary: 'List users in the authenticated tenant' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'search', required: false, type: String, example: 'john' })
    @ApiQuery({ name: 'roleId', required: false, type: String, example: '00000000-0000-0000-0000-000000000000' })
    @ApiOkResponse({ type: UserListResponseDto })
    public async getTenantUsers(
        @Query() getUsersQueryDto: GetUsersQueryDto,
        @CurrentUser() user: CurrentUserPayload
    ){
        return await this.userService.getTenantUsers(getUsersQueryDto, user.tenantId)
    }

    @Patch(':userId')
    @Permissions(PERMISSION_CODES.USER_MODIFY)
    @ApiParam({ name: 'userId', format: 'uuid' })
    @ApiOperation({ summary: 'Update a user' })
    public async updateUser(
        @Body() updateUserDto: UpdateUserDto,
        @Param('userId', ParseUUIDPipe) userId: string
    ){
        return await this.userService.updateUser(updateUserDto,userId)
    }

    @Delete(':userId')
    @Permissions(PERMISSION_CODES.USER_MODIFY)
    @ApiParam({ name: 'userId', format: 'uuid' })
    @ApiOperation({ summary: 'Delete a user' })
    public async deleteUser(
        @Param('userId', ParseUUIDPipe) userId: string
    ){
        return await this.userService.deleteUser(userId)
    }
}
