import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UserInfo } from 'src/types';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserInfo(userId: string): Promise<UserInfo> {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          username: true,
          firstname: true,
          lastname: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        } satisfies { [K in keyof UserInfo]: boolean },
      });

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Pengguna tidak ditemukan');
      }
      throw new ForbiddenException();
    }
  }

  async editUser(userId: string, dto: UpdateUserDto): Promise<UpdateUserDto> {
    try {
      const userEdit = await this.prisma.user.update({
        where: { id: userId },
        data: dto,
        select: {
          username: true,
          firstname: true,
          lastname: true,
        },
      });
      return userEdit;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Pengguna tidak ditemukan');
      }
      throw new ForbiddenException();
    }
  }
}
