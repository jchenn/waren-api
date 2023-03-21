import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('user')
export class UserController {
  constructor(private readonly configService: ConfigService) {}

  @Get('list')
  findAll() {
    return {
      code: 200,
      data: 'user list' + this.configService.get('GREETING_MSG'),
    };
  }
}
