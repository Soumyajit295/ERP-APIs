import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUserPayload } from './types/current-user.type';

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const user = request.user as CurrentUserPayload | undefined;

    return data ? user?.[data] : user;
  },
);
