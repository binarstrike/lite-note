import { validateObjectWithZod } from '../utils';
import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

const nodeEnv = ['production', 'development', 'test'] as const;

const EnvConfigSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  COOKIE_SECRET: z.string(),
  NODE_ENV: z.enum(nodeEnv),
  DEFAULT_API_VERSION: z.string(),
  CORS_ORIGINS: z
    .string()
    .transform((origin) => origin.split(','))
    .default('*'),
  SERVER_PORT: z
    .string()
    .transform((port) => parseInt(port, 10))
    .default('3000'),
});

export const EnvParsedConfig = validateObjectWithZod(EnvConfigSchema, process.env);

export type EnvConfigType = typeof EnvParsedConfig;
