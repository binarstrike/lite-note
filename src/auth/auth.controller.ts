import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, UserLoginDto } from './dto';

@Controller('auth') //* /auth
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup') //* /auth/signup
  signup(@Body() createUser: CreateUserDto) {
    return this.authService.signup(createUser);
  }

  @HttpCode(HttpStatus.OK) //* set status kode menjadi 200 OK
  @Post('signin') //* /auth/signin
  async signin(@Body() userLogin: UserLoginDto) {
    return this.authService.signin(userLogin);
  }
}
