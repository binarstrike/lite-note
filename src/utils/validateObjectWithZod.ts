import { z } from 'zod';

export function validateObjectWithZod<
  T extends z.ZodObject<Record<string, any>>,
>(zodSchema: T, obj: any): T['_type'] {
  const validatedObject = zodSchema.parse(obj) as T['_type'];
  return validatedObject;
}
