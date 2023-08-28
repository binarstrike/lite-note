import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Tokens } from 'src/types';

export const ApiBearerAuthHeader = (token: keyof Tokens) => applyDecorators(ApiBearerAuth(token));
