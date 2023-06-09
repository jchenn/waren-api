import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TuShareService } from 'src/utils/tushare.util';
import { StockDTO } from './dto/StockDTO';
import { StockEntity } from '../../common/entities/stock.entity';
import { Repository } from 'typeorm';
import { DailyEntity } from 'src/common/entities/daily.entity';
import { DailyTradeDTO } from './dto/DailyTradeDTO';

interface StockBasicResponse {
  items: StockDTO[];
  fields: string[];
  has_more: boolean;
}

@Injectable()
export class StockService {
  @Inject(TuShareService)
  private readonly tuShareService: TuShareService;

  @InjectRepository(StockEntity)
  private readonly stockRepository: Repository<StockEntity>;

  @InjectRepository(DailyEntity)
  private readonly dailyRepository: Repository<DailyEntity>;

  async getStockList(
    limit: number,
    offset: number,
  ): Promise<StockBasicResponse> {
    const data = await this.tuShareService.get(
      'stock_basic',
      {
        exchange: '',
        list_status: 'L',
        limit,
        offset,
      },
      'ts_code,symbol,name,area,industry,market,exchange,curr_type,list_status,list_date,delist_date,is_hs',
    );
    return data;
  }

  async saveOrUpdateStockList(list: StockDTO[], onlyAdd: boolean) {
    list.forEach(async (item) => {
      const entity = {
        code: item.ts_code,
        name: item.name,
        area: item.area,
        industry: item.industry,
        market: item.market,
        exchange: item.exchange,
        currType: item.curr_type,
        listStatus: item.list_status,
        listDate: item.list_date,
        delistDate: item.delist_date,
        isHs: item.is_hs,
      };

      const stock = await this.stockRepository.findOneBy({
        code: item.ts_code,
      });

      if (stock === null) {
        await this.stockRepository.save(entity);
      } else if (!onlyAdd) {
        await this.stockRepository.update(stock.id, entity);
      }
    });
  }

  async getStockDailyTrade(tradeDate: string) {
    const dailyData = await this.dailyRepository.findOneBy({
      tradeDate,
    });

    if (dailyData !== null) {
      return { fields: [], items: [], has_more: false };
    }

    const data = await this.tuShareService.get(
      'daily',
      {
        trade_date: tradeDate,
      },
      'ts_code,trade_date,open,high,low,close,pre_close,change,pct_chg,vol,amount',
    );

    return data;
  }

  async deleteDailyTrade(tradeDate: string) {
    await this.dailyRepository.delete({
      tradeDate,
    });
  }

  async saveDailyTrade(dto: DailyTradeDTO) {
    const entity = {
      tradeDate: dto.trade_date,
      code: dto.ts_code,
      open: dto.open,
      high: dto.high,
      low: dto.low,
      close: dto.close,
      preClose: dto.pre_close,
      change: dto.change,
      pctChg: dto.pct_chg,
      vol: dto.vol,
      amount: dto.amount,
    };

    await this.dailyRepository.save(entity);
  }
}
