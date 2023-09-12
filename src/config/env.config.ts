import { validateObjectWithZod } from 'src/utils';
import { EnvConfigSchema } from 'src/schema';
import * as dotenv from 'dotenv';

dotenv.config();

export const EnvParsedConfig = validateObjectWithZod(EnvConfigSchema, process.env);
