import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, UserLoginDto } from './dto';
import { ApiBearerAuthHeader, GetUser, Public } from 'src/common/decorators';
import { JwtRefreshGuard } from 'src/common/guards';
import { Tokens } from 'src/types';
import { AuthTokenResponseSchema } from 'src/swagger-ui/schema';

@ApiTags('auth')
@Controller('auth') //* /auth
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Registrasi pengguna baru.
   */
  @ApiCreatedResponse({
    description: 'Mengembalikan dua token yaitu access token dan refresh token',
    type: AuthTokenResponseSchema,
  })
  @Public()
  @Post('signup') //* /auth/signup
  signup(@Body() dto: CreateUserDto): Promise<Tokens> {
    return this.authService.signup(dto);
  }

  /**
   * Pengguna masuk.
   */
  @ApiOkResponse({
    description: 'Mengembalikan dua token yaitu access token dan refresh token',
    type: AuthTokenResponseSchema,
  })
  @Public()
  @HttpCode(HttpStatus.OK) //* set status kode menjadi 200 OK
  @Post('signin') //* /auth/signin
  signin(@Body() dto: UserLoginDto): Promise<Tokens> {
    return this.authService.signin(dto);
  }

  /**
   * Pengguna keluar.
   */
  @ApiNoContentResponse({
    description: 'Jika pengguna berhasil keluar maka tidak akan mengembalikan data apa pun',
  })
  @ApiBearerAuthHeader('accessToken')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout') //* /auth/logout
  logout(@GetUser('id') userId: string): void {
    this.authService.logout(userId);
  }

  /**
   * Memperbarui access token dan refresh token.
   */
  @ApiOkResponse({
    description: 'Mengembalikan dua token yaitu access token dan refresh token',
    type: AuthTokenResponseSchema,
  })
  @Public()
  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuthHeader('refreshToken')
  @HttpCode(HttpStatus.OK)
  @Post('refresh') //* /auth/refresh
  refreshToken(
    @GetUser('id') userId: string,
    @GetUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
