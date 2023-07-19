import { ForbiddenException, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async editUser(
    userId: string,
    dto: UpdateUserDto,
  ): Promise<{ [key: string]: any }> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { ...dto },
      });
      return { message: 'success' };
    } catch (_) {
      throw new ForbiddenException();
    }
  }
}
