import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TuShareService } from 'src/utils/tushare.util';
import { StockDTO } from './dto/StockDTO';
import { StockEntity } from '../../common/entities/stock.entity';
import { Repository } from 'typeorm';

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

  async saveOrUpdateStockList(list: StockDTO[]) {
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
      } else {
        await this.stockRepository.update(stock.id, entity);
      }
    });
  }
}
