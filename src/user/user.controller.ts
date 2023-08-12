import { Body, Controller, Get, Patch } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../common/decorators';
import { UpdateUserDto } from './user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch()
  updateUser(@GetUser('id') userId: string, @Body() dto: UpdateUserDto): Promise<UpdateUserDto> {
    return this.userService.editUser(userId, dto);
  }
}
