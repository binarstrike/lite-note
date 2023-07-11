import { z } from 'zod';

export function validateConfig<T extends z.ZodObject<Record<string, any>>>(
  zodObject: T,
  validateWith: any,
): T['_type'] {
  const parsedConfig = zodObject.parse(validateWith) as T['_type'];
  return parsedConfig;
}
