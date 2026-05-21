import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { ROLE_KEY } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector
    ){}
    canActivate(context: ExecutionContext): boolean  {
        const requiredRules = this.reflector.getAllAndOverride(ROLE_KEY,[context.getHandler(),context.getClass()])
        console.log(requiredRules)
        if(!requiredRules){
            return false;
        }
        const {user} = context.switchToHttp().getRequest()
        console.log(user)

        if(!user){
            throw new ForbiddenException('User not authenticated')
        }

        if(!user.roleName || !Array.isArray(user.roleName)){
            throw new ForbiddenException('User roles not found');
        }

        const hasRole = requiredRules.some((role) => user.roleName.includes(role))

        if (!hasRole) {
            throw new ForbiddenException(`Access denied. Required roles: ${requiredRules.join(', ')}`);
        }

        return true;
    }
}