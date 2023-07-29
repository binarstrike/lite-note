import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { NoteParamsEndpoint } from '../../types';

type ParamStringKeys = keyof NoteParamsEndpoint;

export const GetQueryParams = createParamDecorator(
  (data: ParamStringKeys | undefined, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    if (data && request.query) {
      return request.query[data];
    }
    return request.query;
  },
);
