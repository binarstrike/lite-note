import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserWithoutHashAndEmail } from '../../types';

export const GetUser = createParamDecorator(
  (data: keyof UserWithoutHashAndEmail | undefined, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    if (data && request.user) {
      return request.user[data];
    }
    return request.user;
  },
);
