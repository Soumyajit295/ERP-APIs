import {Body, Controller, Get, Post, Req, Res, UnauthorizedException} from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { parseMaxAge } from 'src/common/utils/calculateExpiry.util';
import { ConfigService } from '@nestjs/config';
import { GenerateResetLinkDto } from './dto/generate-resetlink.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from './public.decorator';
import { CurrentUser } from './currentuser.decorator';
import type { CurrentUserPayload } from './types/current-user.type';
import { SWAGGER_BEARER_AUTH, SWAGGER_REFRESH_COOKIE_AUTH } from 'src/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a tenant and owner user' })
  public async register(
    @Body() registerDto: RegisterDto
  ) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login and receive an access token' })
  public async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, refreshToken } = await this.authService.login(loginDto);
    this.setRefreshTokenCookie(res, refreshToken);
    return {accessToken};
  }

  @Public()
  @Post('refresh-token')
  @ApiCookieAuth(SWAGGER_REFRESH_COOKIE_AUTH)
  @ApiOperation({ summary: 'Refresh the access token using the refresh cookie' })
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
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiCookieAuth(SWAGGER_REFRESH_COOKIE_AUTH)
  @ApiOperation({ summary: 'Logout and revoke the refresh token' })
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

  @Public()
  @Post('generate-resetlink')
  @ApiOperation({ summary: 'Generate a password reset link' })
  public async generateResetLink(
    @Body() generateResetLinkDto: GenerateResetLinkDto
  ){
    return await this.authService.generateResetLink(generateResetLinkDto)
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset the current user password' })
  public async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto
  ){
    return await this.authService.resetPassword(resetPasswordDto)
  }

  @Get('me')
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  public async getMe(
    @CurrentUser() user: CurrentUserPayload
  ){
    return await this.authService.getMe(user.userId)
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
