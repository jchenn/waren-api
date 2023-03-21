import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TuShareService } from 'src/utils/tushare.util';
import { QuantifyController } from './quantify.controller';
import { QuantifyService } from './quantify.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [QuantifyController],
  providers: [QuantifyService, TuShareService],
})
export class QuantifyModule {}
