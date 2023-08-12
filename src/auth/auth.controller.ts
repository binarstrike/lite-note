import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, UserLoginDto } from './dto';
import { GetUser, Public } from '../common/decorators';
import { JwtRefreshGuard } from '../common/guards';
import { Tokens } from '../types';

@Controller('auth') //* /auth
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup') //* /auth/signup
  signup(@Body() dto: CreateUserDto): Promise<Tokens> {
    return this.authService.signup(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK) //* set status kode menjadi 200 OK
  @Post('signin') //* /auth/signin
  signin(@Body() dto: UserLoginDto): Promise<Tokens> {
    return this.authService.signin(dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout') //* /auth/logout
  logout(@GetUser('id') userId: string): void {
    this.authService.logout(userId);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh') //* /auth/refresh
  refreshToken(
    @GetUser('id') userId: string,
    @GetUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
