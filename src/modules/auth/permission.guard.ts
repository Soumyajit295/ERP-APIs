import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PermissionRepository } from "src/repositories/permission.repository";
import { PERMISSION_KEY } from "./permissions.decorator";
import type { CurrentUserPayload } from "./types/current-user.type";

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly permissionRepository: PermissionRepository
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSION_KEY,[
            context.getHandler(),
            context.getClass()
        ]);

        if(!requiredPermissions || requiredPermissions.length === 0){
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user as CurrentUserPayload | undefined;

        if(!user?.userId){
            throw new ForbiddenException('User not authenticated');
        }

        const userPermissions = await this.permissionRepository.getAllPermissionForUser(user.userId);
        const userPermissionSet = new Set(userPermissions.map((permission) => permission.toLowerCase()));

        const missingPermissions = requiredPermissions.filter(
            (permission) => !userPermissionSet.has(permission.toLowerCase())
        );

        if(missingPermissions.length > 0){
            throw new ForbiddenException(`Access denied. Required permissions: ${missingPermissions.join(', ')}`);
        }

        return true;
    }
}
