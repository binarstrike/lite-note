import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvConfigType } from 'src/types';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload, ValidatedJwtPayloadWithRefreshToken } from 'src/types';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService<EnvConfigType, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true, //* properti digunakan agar method validate dapat menerima object request
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  validate(req: Request, payload: JwtPayload): ValidatedJwtPayloadWithRefreshToken {
    //* Authorization: Bearer ey.....jwt_access_token
    const refreshToken = req.headers['authorization']?.split(' ')[1];

    if (!refreshToken) throw new UnauthorizedException('Refresh token is invalid');

    return { id: payload.sub, refreshToken };
  }
}
