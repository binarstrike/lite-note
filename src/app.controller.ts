import { Controller, Get, VERSION_NEUTRAL, Version } from '@nestjs/common';
import { Public } from './common/decorators';

@Controller()
export class AppController {
  @Version(VERSION_NEUTRAL)
  @Public()
  @Get()
  getHello(): string {
    return 'Hello World';
  }
}
