import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, UserLoginDto } from './dto';
import { GetUser, Public } from '../common/decorators';
import { JwtRefreshGuard } from '../common/guards';

@Controller('auth') //* /auth
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup') //* /auth/signup
  signup(@Body() dto: CreateUserDto) {
    return this.authService.signup(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK) //* set status kode menjadi 200 OK
  @Post('signin') //* /auth/signin
  signin(@Body() dto: UserLoginDto) {
    return this.authService.signin(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout') //* /auth/logout
  logout(@GetUser('id') userId: any) {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh') //* /auth/refresh
  refreshToken(
    @GetUser('id') userId: string,
    @GetUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
