import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DailyEntity } from 'src/common/entities/daily.entity';
import { TuShareService } from 'src/utils/tushare.util';
import { Repository } from 'typeorm';

@Injectable()
export class QuantifyService {
  @Inject(TuShareService)
  private readonly tushareService: TuShareService;

  @InjectRepository(DailyEntity)
  private readonly dailyRepository: Repository<DailyEntity>;

  async getPool() {
    const { data } = await this.tushareService.get('daily', {
      ts_code: '000001.SZ',
      trade_date: '20230320',
    });

    console.log(data);
    return data;
  }

  async getDailyTradeByCodeAndDate(
    code: string,
    tradeDate: string,
    limit: number,
  ) {
    const data = await this.dailyRepository
      .createQueryBuilder('daily')
      .where('daily.code = :code', { code })
      .andWhere('daily.tradeDate <= :tradeDate', { tradeDate })
      .orderBy('daily.tradeDate', 'DESC')
      .limit(limit)
      .getMany();
    return data;
  }
}
