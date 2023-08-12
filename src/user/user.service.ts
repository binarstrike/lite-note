import { ForbiddenException, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async editUser(userId: string, dto: UpdateUserDto): Promise<UpdateUserDto> {
    try {
      const userEdit = await this.prisma.user.update({
        where: { id: userId },
        data: { ...dto },
        select: { username: true, firstname: true, lastname: true } satisfies {
          [K in keyof UpdateUserDto]: boolean;
        },
      });
      return userEdit;
    } catch (_) {
      throw new ForbiddenException();
    }
  }
}
