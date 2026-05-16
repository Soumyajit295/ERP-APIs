import { Injectable } from '@nestjs/common';
import { RegisterDto } from '../auth/dto/register.dto';
import { UsersRepository } from 'src/repositories/user.repository';

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository
    ){}
    public async register(registerDto: RegisterDto){
        return await this.usersRepository.register(registerDto)
    }
}
