import z from 'zod';

export const EnvConfigSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  COOKIE_SECRET: z.string(),
  NODE_ENV: z.enum(['production', 'development', 'test']),
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
