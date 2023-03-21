import { Controller, Get } from '@nestjs/common';
import { StockDTO } from './dto/StockDTO';
import { StockService } from './stock.service';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('basic/refresh')
  async refreshStockList() {
    // 循环获取股票列表
    let hasMore = true;
    let offset = 0;
    const LIMIT = 400;

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
      await this.stockService.saveOrUpdateStockList(formatData);

      hasMore = has_more;
      offset += LIMIT;
    }

    return {
      code: 200,
      data: 'success',
    };
  }
}
