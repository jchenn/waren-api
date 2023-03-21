import { Controller, Get } from '@nestjs/common';
import { QuantifyService } from './quantify.service';

@Controller('quantify')
export class QuantifyController {
  constructor(private readonly quantifyService: QuantifyService) {}

  @Get('pool')
  getPool() {
    return this.quantifyService.getPool();
  }
}
