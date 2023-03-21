import { Injectable, Inject } from '@nestjs/common';
import { TuShareService } from 'src/utils/tushare.util';

@Injectable()
export class QuantifyService {
  @Inject(TuShareService)
  private readonly tushareService: TuShareService;

  async getPool() {
    const { data } = await this.tushareService.get('daily', {
      ts_code: '000001.SZ',
      trade_date: '20230320',
    });

    console.log(data);
    return data;
  }
}
