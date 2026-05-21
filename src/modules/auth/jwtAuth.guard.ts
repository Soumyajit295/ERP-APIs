import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "./public.decorator";

@Injectable()
export class JwtAuthGuard implements CanActivate{
    constructor(
        private readonly jwtservice: JwtService,
        private readonly configService: ConfigService,
        private readonly reflector: Reflector
    ){}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY,[context.getHandler(),context.getClass()])
        if(isPublic){
            return true;
        }
        const request = context.switchToHttp().getRequest()
        const authHeader = request.headers.authorization
        if(!authHeader){
            throw new UnauthorizedException('Token not found')
        }
        const [_,token] = authHeader.split(' ')

        if(!token){
            throw new UnauthorizedException('Token expired')
        }
        try{
            const payload = await this.jwtservice.verifyAsync(token,{secret: this.configService.get<string>('JWT_SECRET')})
            request.user = payload
            return true;
        } catch(error){
            throw new UnauthorizedException('Invalid token')
        }
    }
}