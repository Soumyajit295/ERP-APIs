import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt'
import { GenerateTokensProvider } from './providers/genearateToken.provider';
import { ConfigService } from '@nestjs/config';
import { calculateExpiry } from 'src/common/utils/calculateExpiry.util';
import { DatabaseService } from 'src/database/database.service';
import { RefreshTokensRepository } from 'src/repositories/refresh-token.repository';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly genearateTokensProvider: GenerateTokensProvider,
        private readonly refreshTokensRepository: RefreshTokensRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
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

    public async refreshToken(token: string){
        try {
            const result = await this.jwtService.verifyAsync(
                token,
                {secret: this.configService.get<string>('JWT_SECRET')}
            )
            if(!result){
                throw new UnauthorizedException('Invalid token, cannot verify')
            }
            
            const user = await this.usersService.getUserById(result.sub)
            if(!user) {
                throw new BadRequestException('User not found')
            }
            const existingToken = await this.refreshTokensRepository.serachByRefreshToken(token)

            console.log("Existing Token : ",existingToken)

            if(!existingToken){
                throw new UnauthorizedException('Inavlid token, cannot find token')
            }
            if(new Date(existingToken.expiry).getTime() < Date.now()){
                throw new UnauthorizedException('Token expired, please login again')
            }
            if(existingToken.revoked){
                await this.refreshTokensRepository.revokeAllToken(user.id)
                throw new UnauthorizedException('Token reused by someone else, please re login')
            }

            // Generate new pair of accessToken , refreshToken
            const {accessToken,refreshToken} = await this.genearateTokensProvider.generateTokens(user)
            
            await this.refreshTokensRepository.update(existingToken.id,refreshToken,user.id)

            return {accessToken,refreshToken}
            
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
                throw error
            }
            throw new InternalServerErrorException('Unable to refresh the token')
        }
    }   
}
