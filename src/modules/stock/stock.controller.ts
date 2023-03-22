import { Controller, Get, Query } from '@nestjs/common';
import { StockDTO } from './dto/StockDTO';
import { StockService } from './stock.service';
import * as dayjs from 'dayjs';
import { DailyTradeDTO } from './dto/DailyTradeDTO';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('basic/update')
  async updateStockList(
    /** only_add 是否只添加新数据 */
    @Query() params: any,
  ) {
    const onlyAdd = params.onlyAdd === 'true';
    // 循环获取股票列表
    let hasMore = true;
    let offset = 0;
    const LIMIT = 500;

    while (hasMore) {
      const { items, fields, has_more } = await this.stockService.getStockList(
        LIMIT,
        offset,
      );

      const formatData: StockDTO[] = items.map((item: any) => {
        const stock: any = {};
        fields.forEach((field: string, index: number) => {
          stock[field] = item[index];
        });
        return stock as StockDTO;
      });

      // 更新数据库
      await this.stockService.saveOrUpdateStockList(formatData, onlyAdd);

      hasMore = has_more;
      offset += LIMIT;
    }

    console.log('[/api/stock/basic/update] SUCCESS');
    return {
      code: 200,
      data: 'success',
    };
  }

  @Get('daily/update')
  async updateStockDaily(
    /**
     * from_date 从指定日期往前更新，格式 YYYYMMDD 默认昨天
     * days 更新指定天数，默认10
     * need_update 老数据是否强制更新，默认false
     * */
    @Query()
    params: any,
  ) {
    const fromDate =
      params.from_date || dayjs().subtract(1, 'day').format('YYYYMMDD');
    const days = parseInt(params.days) || 10;
    const needUpdate = params.need_update === 'true';

    for (let i = 0; i < days; i++) {
      const tradeDate = dayjs(fromDate).subtract(i, 'day').format('YYYYMMDD');

      // 先删除历史数据
      if (needUpdate) {
        await this.stockService.deleteDailyTrade(tradeDate);
      }

      const { fields, items } = await this.stockService.getStockDailyTrade(
        tradeDate,
      );

      items.forEach(async (item: any) => {
        const entity: any = {};
        fields.forEach((field: string, index: number) => {
          entity[field] = item[index];
        });
        this.stockService.saveDailyTrade(entity as DailyTradeDTO);
      });
    }

    console.log('[/api/stock/daily/update] SUCCESS');
    return {
      code: 200,
      data: 'success',
    };
  }
}
