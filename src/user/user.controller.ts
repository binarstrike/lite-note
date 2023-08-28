import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiBearerAuthHeader, GetUser } from 'src/common/decorators';
import { UpdateUserDto } from './dto';
import { UserService } from './user.service';
import { UserInfoResponseSchema } from 'src/swagger-ui/schema';
import { UserInfo } from 'src/types';

@ApiTags('users')
@ApiBearerAuthHeader('accessToken')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * Mengambil informasi tentang pengguna saat ini.
   */
  @ApiOkResponse({
    description: 'Mengembalikan data atau informasi pengguna',
    type: UserInfoResponseSchema,
  })
  @Get('me')
  getUserInfo(@GetUser('id') userId: string): Promise<UserInfo> {
    return this.userService.getUserInfo(userId);
  }

  /**
   * Memperbarui data pengguna.
   */
  @ApiOkResponse({
    description: 'Mengembalikan data pengguna yang sudah di perbarui.',
    type: UpdateUserDto,
  })
  @Patch()
  updateUser(@GetUser('id') userId: string, @Body() dto: UpdateUserDto): Promise<UpdateUserDto> {
    return this.userService.editUser(userId, dto);
  }
}
