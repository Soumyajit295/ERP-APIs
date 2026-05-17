import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt'
import { GenerateTokensProvider } from './providers/genearateToken.provider';
import { ConfigService } from '@nestjs/config';
import { calculateExpiry } from 'src/common/utils/calculateExpiry.util';
import { DatabaseService } from 'src/database/database.service';
import { RefreshTokensRepository } from 'src/repositories/refresh-token.repository';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly genearateTokensProvider: GenerateTokensProvider,
        private readonly refreshTokensRepository: RefreshTokensRepository
    ){}

    public async register(registerDto: RegisterDto){
        return this.usersService.register(registerDto)
    }

    public async login(loginService: LoginDto){
        const user = await this.usersService.findByEmail(loginService.email)
        if(!user){
            throw new BadRequestException('User not registered')
        }
        const hashedPassword = await this.usersService.getPasswordById(user.id)
        const checkPassword = await bcrypt.compare(loginService.password,hashedPassword)
        if(!checkPassword){
            throw new BadRequestException('Email or password is wrong')
        }

        const {accessToken,refreshToken} = await this.genearateTokensProvider.generateTokens(user)

        try {
            const createdRefreshToken = await this.refreshTokensRepository.create(refreshToken,user.id)
            return {accessToken,refreshToken: createdRefreshToken}
        } catch (error: any) {
            throw new InternalServerErrorException('Unable to login the user')
        }

    }
}
