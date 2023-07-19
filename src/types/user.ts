import { User } from '@prisma/client';
import { ExcludeProp } from '../helpers';

export type UserWithoutHashAndEmail = ExcludeProp<User, 'email' | 'hash'>;
