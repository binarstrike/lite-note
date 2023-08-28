import { User } from '@prisma/client';
import { ExcludeProp } from 'src/helpers';

export type UserRequestObjectPropKeys = keyof Pick<User, 'id' | 'refreshToken'>;

export type UserInfo = ExcludeProp<User, 'refreshToken' | 'id' | 'hash'>;
