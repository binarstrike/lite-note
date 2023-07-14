import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvConfigType } from '../../config';
import { PrismaService } from '../../prisma/prisma.service';
import { z } from 'zod';

const jwtPayloadValidation = z.object({
  sub: z.string(),
  email: z.string(),
});

type jwtPayloadValidationType = z.infer<typeof jwtPayloadValidation>;

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

  async validate(payload: jwtPayloadValidationType) {
    const parsedJwtPayload = jwtPayloadValidation.parse(payload);

    const user = await this.prisma.user.findUnique({
      where: {
        id: parsedJwtPayload.sub,
      },
      select: {
        email: true,
        name: true,
        id: true,
      },
    });
    return user;
  }
}
