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

    public async findByEmail(email: string){
        return await this.usersRepository.findByEmail(email)
    }

    public async getPasswordById(userId: string){
        return await this.usersRepository.getPasswordById(userId)
    }

    public async getUserById(userId: string){
        return await this.usersRepository.findById(userId)
    }

    public async updatePassword(email: string,password: string){
        return await this.usersRepository.updatePassword(email,password)
    }
}
