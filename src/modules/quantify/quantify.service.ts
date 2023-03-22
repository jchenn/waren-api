import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DailyEntity } from 'src/common/entities/daily.entity';
import { StockEntity } from 'src/common/entities/stock.entity';
import { TuShareService } from 'src/utils/tushare.util';
import { Repository } from 'typeorm';

const MEM_CACHE = {};

@Injectable()
export class QuantifyService {
  @Inject(TuShareService)
  private readonly tushareService: TuShareService;

  @InjectRepository(DailyEntity)
  private readonly dailyRepository: Repository<DailyEntity>;

  @InjectRepository(StockEntity)
  private readonly stockRepository: Repository<StockEntity>;

  async getStockList(limit?: number) {
    const data = await this.stockRepository.find({
      select: ['code', 'name'],
      take: limit || undefined,
    });
    return data;
  }

  async getDailyTradeByCodeAndDate(
    code: string,
    tradeDate: string,
    limit: number,
  ) {
    // TODO redis 优化
    const MEM_KEY = `${code}_${tradeDate}`;
    if (MEM_CACHE[MEM_KEY]) {
      console.log('cache hit 2', MEM_KEY);
      return MEM_CACHE[MEM_KEY];
    }

    const data = await this.dailyRepository
      .createQueryBuilder('daily')
      .select(['daily.tradeDate', 'daily.close'])
      .where('daily.code = :code', { code })
      .andWhere('daily.tradeDate <= :tradeDate', { tradeDate })
      .orderBy('daily.tradeDate', 'DESC')
      .limit(limit)
      .getMany();

    MEM_CACHE[MEM_KEY] = data;
    return data;
  }
}
