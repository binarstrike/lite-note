import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { NoteQueryParamType } from 'src/types';
import { Request } from 'express';

type QueryParamKeys = keyof NoteQueryParamType;

export const GetQueryParams = createParamDecorator(
  (data: QueryParamKeys | undefined, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    return data && request.query ? request.query[data] : request.query;
  },
);
