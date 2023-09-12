import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto, UserLoginDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { EnvConfigType } from 'src/types';
import { Tokens } from 'src/types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService<EnvConfigType, true>,
  ) {}

  //* /auth/signup POST handler
  async signup(dto: CreateUserDto): Promise<Tokens> {
    const hash = await this.hashMe(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          username: dto.username,
          firstname: dto.firstname,
          lastname: dto.lastname,
          hash,
        },
      });
      const tokens = await this.signToken(user.id);
      await this.updateRefreshToken(user.id, tokens.refreshToken);
      return tokens;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Account already exists');
        }
      }
      throw error;
    }
  }
  //* /auth/signin POST handler
  async signin(dto: UserLoginDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const comparePassword = await argon.verify(user.hash, dto.password);

    if (!comparePassword) {
      throw new UnauthorizedException('Wrong Credentials');
    }

    const tokens = await this.signToken(user.id);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  //* /auth/logout POST handler
  async logout(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { refreshToken: true },
    });
    if (!user?.refreshToken) throw new UnauthorizedException();
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
      });
    } catch (_) {
      throw new ForbiddenException();
    }
  }

  //* /auth/refresh POST handler
  async refreshTokens(userId: string, refreshToken: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) throw new ForbiddenException('User not found or invalid');

    const tokenMatches = await argon.verify(user.refreshToken, refreshToken);

    if (!tokenMatches) throw new ForbiddenException('Token is invalid');

    const tokens = await this.signToken(userId);

    await this.updateRefreshToken(userId, tokens.refreshToken);

    return tokens;
  }

  private async signToken(userId: string): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { sub: userId },
        { secret: this.config.get<string>('JWT_SECRET'), expiresIn: '15m' }, // 15m
      ),
      this.jwt.signAsync(
        { sub: userId },
        {
          secret: this.config.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await this.hashMe(refreshToken);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  private hashMe(data: string): Promise<string> {
    return argon.hash(data);
  }
}
