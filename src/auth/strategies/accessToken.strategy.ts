import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvConfigType } from 'src/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtPayload, ValidatedJwtPayload } from 'src/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  //* karena class Strategy dari berasal dari package passport-jwt maka
  //* parameter kedua dari fungsi PassportStrategy diatas secara default adalah jwt
  constructor(config: ConfigService<EnvConfigType, true>, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): ValidatedJwtPayload {
    if (payload.sub) {
      return {
        id: payload.sub,
      };
    }
    throw new UnauthorizedException();
  }
}
