import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyEntity } from 'src/common/entities/daily.entity';
import { StockEntity } from 'src/common/entities/stock.entity';
import { TuShareService } from 'src/utils/tushare.util';
import { QuantifyController } from './quantify.controller';
import { QuantifyService } from './quantify.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([StockEntity, DailyEntity]),
  ],
  controllers: [QuantifyController],
  providers: [QuantifyService, TuShareService],
})
export class QuantifyModule {}
