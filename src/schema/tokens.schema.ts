import { Tokens } from 'src/types';
import z from 'zod';

export const tokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
} satisfies Record<keyof Tokens, z.ZodString>);
