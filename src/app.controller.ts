import { Controller, Get, HttpCode, HttpStatus, Redirect, VERSION_NEUTRAL, Version } from '@nestjs/common';
import { Public } from './common/decorators';
import { ApiFoundResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('root')
@Controller()
export class AppController {
  @ApiFoundResponse({ description: 'Mengalihkan ke halaman dokumentasi' })
  @Version(VERSION_NEUTRAL)
  @Redirect('/api')
  @HttpCode(HttpStatus.FOUND)
  @Public()
  @Get()
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  root() {}
}
