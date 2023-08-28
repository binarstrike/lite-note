import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { NoteQueryParamKeys } from 'src/types';
import { Request } from 'express';

type QueryParamKeys = NoteQueryParamKeys;

export const GetQueryParams = createParamDecorator(
  (data: QueryParamKeys | undefined, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    return data && request.query ? request.query[data] : request.query;
  },
);
