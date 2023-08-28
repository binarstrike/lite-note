import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRequestObjectPropKeys } from 'src/types';

export const GetUser = createParamDecorator(
  (data: UserRequestObjectPropKeys | undefined, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    return data && request.user ? request.user[data] : request.user;
  },
);
