import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async editUser(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
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
