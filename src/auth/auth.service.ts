import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateUserDto, UserLoginDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { EnvConfigType } from '../config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService<EnvConfigType, true>,
  ) {}
  async signup(createUser: CreateUserDto) {
    const hash = await argon.hash(createUser.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: createUser.email,
          name: createUser.name,
          hash,
        },
      });
      return await this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Akun sudah terdaftar!');
        }
      }
      throw error;
    }
  }

  async signin(userLogin: UserLoginDto) {
    //* cari user di database
    const user = await this.prisma.user.findUnique({
      where: { email: userLogin.email },
    });

    //* jika user tidak ditemukan atau ada kesalahan pada input data maka akan throw error
    if (!user) {
      throw new ForbiddenException('pengguna tidak ditemukan');
    }

    //* bandingkan password input dari user dengan hash yang ada pada database
    const comparePassword = await argon.verify(user.hash, userLogin.password);

    //* jika passowrd salah maka akan throw error
    if (!comparePassword) {
      throw new ForbiddenException('kata sandi salah');
    }

    return await this.signToken(user.id, user.email);
  }

  async signToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string }> {
    //* mengambil jwt secret dari .env variabel
    const secret = this.config.get<string>('JWT_SECRET');

    const payload = {
      sub: userId,
      email,
    };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret,
    });

    return {
      access_token: token,
    };
  }
}
