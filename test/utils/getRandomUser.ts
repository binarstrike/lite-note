import { CreateUserDto } from 'src/auth/dto';
import { users } from 'test/users.json';
import z from 'zod';

const usersSchema = z.array(
  z.object({
    username: z.string(),
    firstname: z.string(),
    lastname: z.string(),
    email: z.string(),
    password: z.string(),
  } satisfies Record<keyof CreateUserDto, z.ZodString>),
);
type UsersSchemaType = z.infer<typeof usersSchema>;

const usersData = usersSchema.parse(users);

export function getRandomUser(): UsersSchemaType extends Array<infer U> ? U : Record<string, any> {
  return usersData[~~(Math.random() * usersData.length)];
}
