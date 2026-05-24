import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/common/dto/createUser.dto';
import { CurrentUser } from '../auth/currentuser.decorator';
import type { CurrentUserPayload } from '../auth/types/current-user.type';

@Controller('users')
export class UsersController {
    constructor(
        private readonly userService: UsersService
    ){}

    @Post()
    public async createUser(
        @Body() createUserDto: CreateUserDto,
        @CurrentUser() user: CurrentUserPayload
    ){
        return await this.userService.createUser(createUserDto,user.tenantId)
    }

    @Get()
    public async getTenantUsers(
        @CurrentUser() user: CurrentUserPayload
    ){
        return this.userService.getTenantUsers(user.tenantId)
    }
}
