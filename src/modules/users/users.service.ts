import { Injectable } from '@nestjs/common';
import { RegisterDto } from '../auth/dto/register.dto';
import { UsersRepository } from 'src/repositories/user.repository';
import { PermissionRepository } from 'src/repositories/permission.repository';
import { CreateUserDto } from 'src/common/dto/createUser.dto';

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly permissionRepository: PermissionRepository
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

    public async getMe(userId: string){
        const user = await this.usersRepository.getUser(userId)
        const userPermissions = await this.permissionRepository.getAllPermissionForUser(userId)
        return {
            ...user,
            permissions: userPermissions
        }
    }

    public async createUser(createUserDto: CreateUserDto,tenantId: string){
        return await this.usersRepository.createUser(createUserDto,tenantId)
    }

    public async getTenantUsers(tenantId: string){
        return await this.usersRepository.getTenantUsers(tenantId)
    }
}
