import {Body, Controller, Post, Req, Res, UnauthorizedException} from '@nestjs/common';
import type { Response, Request } from 'express';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { parseMaxAge } from 'src/common/utils/calculateExpiry.util';
import { ConfigService } from '@nestjs/config';
import { GenerateResetLinkDto } from './dto/generate-resetlink.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Post('register')
  public async register(
    @Body() registerDto: RegisterDto
  ) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  public async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, refreshToken } = await this.authService.login(loginDto);
    this.setRefreshTokenCookie(res, refreshToken);
    return {accessToken};
  }

  @Post('refresh-token')
  public async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ){
    const refresh_token = req.cookies?.['refresh_token']
    if(!refresh_token){
        throw new UnauthorizedException('Token not found')
    }
    const {accessToken,refreshToken} = await this.authService.refreshToken(refresh_token)
    this.setRefreshTokenCookie(res,refreshToken)
    return {accessToken}
  }

  @Post('logout')
  public async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ){
    const refresh_token = req.cookies?.['refresh_token']
    if(!refresh_token){
        return {message: 'User already logged out'}
    }
    return await this.authService.logout(refresh_token)
  }

  @Post('generate-resetlink')
  public async generateResetLink(
    @Body() generateResetLinkDto: GenerateResetLinkDto
  ){
    return await this.authService.generateResetLink(generateResetLinkDto)
  }

  @Post('reset-password')
  public async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto
  ){
    return await this.authService.resetPassword(resetPasswordDto)
  }

  private setRefreshTokenCookie(
    res: Response,
    refreshToken: string
  ) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: parseMaxAge(this.configService.get<string>('REFRESH_TOKEN_TTL')!)
    });
  }
}