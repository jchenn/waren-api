import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockEntity } from 'src/common/entities/stock.entity';
import { TuShareService } from 'src/utils/tushare.util';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([StockEntity])],
  controllers: [StockController],
  providers: [StockService, TuShareService, ConfigService],
})
export class StockModule {}
