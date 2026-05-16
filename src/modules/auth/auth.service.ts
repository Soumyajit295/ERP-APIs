import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService
    ){}

    public async register(registerDto: RegisterDto){
        return this.usersService.register(registerDto)
    }
}
