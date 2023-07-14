import { validateConfig } from '../utils';
import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

const nodeEnv = ['production', 'development', 'test'] as const;

const EnvConfig = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  COOKIE_SECRET: z.string(),
  NODE_ENV: z.enum(nodeEnv),
  SERVER_PORT: z
    .string()
    .transform((port) => parseInt(port, 10))
    .default('3000'),
});

export const EnvParsedConfig = validateConfig(EnvConfig, process.env);

export type EnvConfigType = typeof EnvParsedConfig;
