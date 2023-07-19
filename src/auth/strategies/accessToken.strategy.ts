import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvConfigType } from '../../config';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../types';
import { ExcludePropWithType } from '../../helpers';
import { User } from '@prisma/client';
import { UserWithoutHashAndEmail } from '../../types';

const selectedUserFields: ExcludePropWithType<
  UserWithoutHashAndEmail,
  'refreshToken',
  boolean
> = {
  id: true,
  username: true,
  firstname: true,
  lastname: true,
  updatedAt: true,
  createdAt: true,
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  //* karena class Strategy dari berasal dari package passport-jwt maka
  //* parameter kedua dari fungsi PassportStrategy diatas secara default adalah jwt
  constructor(
    config: ConfigService<EnvConfigType, true>,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(
    payload: JwtPayload,
  ): Promise<{ [K in keyof typeof selectedUserFields]: User[K] }> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
      select: selectedUserFields,
    });
    if (!user) throw new ForbiddenException();
    return user;
  }
}
