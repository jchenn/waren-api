import { Controller, Get, Query } from '@nestjs/common';
import { DailyEntity } from 'src/common/entities/daily.entity';
import { QuantifyService } from './quantify.service';
import { getMA } from 'src/utils/math.util';
import * as ss from 'simple-statistics';
import * as dayjs from 'dayjs';

const TRACK_DAYS = 30; // 跟踪天数

// 标准差除以平均值,用于反映均线平稳程度. 数字越小，均线越平稳，筛选结果越少
// 0.038  三旺通信
const OFFSET_RATE = 0.04;

@Controller('quantify')
export class QuantifyController {
  constructor(private readonly quantifyService: QuantifyService) {}

  async calculateMA(code: string, startDate: string) {
    const tradeList: DailyEntity[] = await this.quantifyService.getDailyTradeByCodeAndDate(
      code,
      startDate,
      TRACK_DAYS + 120,
    );

    const closeList = tradeList.map((trade) => parseFloat(`${trade.close}`));
    const ma12 = getMA(closeList, 12, TRACK_DAYS);
    const ma74 = getMA(closeList, 74, TRACK_DAYS);
    const ma99 = getMA(closeList, 99, TRACK_DAYS);

    const avg12 = ss.mean(ma12);
    const avg74 = ss.mean(ma74);
    const avg99 = ss.mean(ma99);

    const stdDev12 = ss.standardDeviation(ma12);
    const stdDev74 = ss.standardDeviation(ma74);
    const stdDev99 = ss.standardDeviation(ma99);

    const amountList = tradeList.map((trade) => parseFloat(`${trade.amount}`));

    return {
      ma12,
      ma74,
      ma99,
      avg12,
      avg74,
      avg99,
      stdDev12,
      stdDev74,
      stdDev99,
      lastMa12: ma12[0],
      lastMa74: ma74[0],
      lastMa99: ma99[0],
      amountList,
    };
  }

  checkSatisfy(
    ma12: number[],
    ma74: number[],
    ma99: number[],
    avg12: number,
    avg74: number,
    avg99: number,
    stdDev74: number,
    stdDev99: number,
    amountList: number[],
  ): boolean {
    // 数据不足
    if (ma99[ma99.length - 1] === 0) {
      return false;
    }

    // 近2日涨幅
    const UP_DAY = 2;
    const up12 = ma12[0] / ma12[UP_DAY] - 1;
    const up74 = ma74[0] / ma74[UP_DAY] - 1;
    const up99 = ma99[0] / ma99[UP_DAY] - 1;

    // console.log('均线涨幅', up12 / Math.max(up74, up99));
    // console.log(up12, up74, up99);
    // console.log(ma12[0] - ma74[0], ma12[0] - ma99[0], Math.abs(ma74[0] - ma99[0]));
    // console.log(Math.min(ma74[0] / avg74, ma99[0] / avg99));
    // console.log(ma12[ma12.length - 1], avg12, ma12[0]);
    // console.log(ma12[0] / ss.mean([ma74[0], ma99[0]]));
    // console.log(ss.average(amountList.slice(0, 3)), ss.average(amountList.slice(3, 6)));
    // console.log(ma74[0] / ma99[0]);

    if (
      // 1. 近3日成交量增加
      ss.average(amountList.slice(0, 3)) > ss.average(amountList.slice(3, 6)) &&
      // 2. 股价大于2.5（+农业银行）
      ma12[0] >= 2.5 &&
      // 3. 中线趋势相同，且上升或基本持平（-雅克科技）
      (ma74[0] - avg74) * (ma99[0] - avg99) > 0 &&
      Math.min(ma74[0] / avg74, ma99[0] / avg99) >= 0.985 &&
      // 4. MA74要在MA99上方，允许0.5%的偏差（+农业银行）
      ma74[0] >= ma99[0] * 0.995 &&
      // 5. 近3天MA12均线涨幅更快,有起飞的趋势
      up12 > 0 &&
      Math.min(up74, up99) >= -0.0015 &&
      up12 / Math.max(up74, up99) >= 3 &&
      // 6. MA12突破MA74和MA99,但还没起飞
      ma12[0] / ss.mean([ma74[0], ma99[0]]) > 1 &&
      // 7. 还没有起飞，后续把这个作为校验该策略是否有效的依据
      ma12[0] / ss.mean([ma74[0], ma99[0]]) < 1.04 &&
      // 8. MA74和MA99足够平稳
      stdDev74 <= avg74 * OFFSET_RATE &&
      stdDev99 <= avg99 * OFFSET_RATE
    ) {
      return true;
    }

    return false;
  }

  @Get('strategy/ma/get')
  async getByMAStrategy(
    /**
     * from_date 从指定日期往前计算，格式 YYYYMMDD，默认当天（需要17:00更新每日行情之后）
     * scope_count 在前N个股票中查询,用于验证算法正确性
     */
    @Query() params: any,
  ) {
    // const stockList = await this.quantifyService.getStockList();
    const stockList = await this.quantifyService.getStockList(
      params.scope_count ? parseInt(params.scope_count) : undefined,
    );

    const result = [];
    await Promise.all(
      stockList.map(async (stock) => {
        const { ma12, ma74, ma99, avg12, stdDev74, avg74, stdDev99, avg99, amountList } = await this.calculateMA(
          stock.code,
          params.from_date || dayjs().subtract(1, 'day').format('YYYYMMDD'),
        );

        // console.log(stock.code);
        try {
          if (this.checkSatisfy(ma12, ma74, ma99, avg12, avg74, avg99, stdDev74, stdDev99, amountList)) {
            console.log('符合条件:', stock.code, stock.name);
            result.push({
              code: stock.code,
              name: stock.name,
            });
          }
        } catch (e) {
          console.log('error', e);
          // console.log('ma12', ma12);
          // console.log('ma74', ma74);
          // console.log('ma99', ma99);
        }

        return result;
      }),
    );

    return {
      code: 200,
      data: {
        list: result,
        count: result.length,
      },
    };
  }

  @Get('strategy/ma/get/test')
  async getByMAStrategyTest() {
    const code = '301257.SZ';
    const START_DATE = '20230322';
    // const code = '688618.SH'; // 三旺通信
    // const START_DATE = '20221027';
    // const code = '601288.SH'; // 农业银行
    // const START_DATE = '20221201';

    let satisfied = false;
    const { ma12, ma74, ma99, avg12, stdDev74, avg74, stdDev99, avg99, amountList } = await this.calculateMA(
      code,
      START_DATE,
    );

    // console.log(ma12[0], ma74[0], ma99[0]);
    // console.log(stdDev74, avg74);
    // console.log(stdDev99, avg99);
    if (this.checkSatisfy(ma12, ma74, ma99, avg12, avg74, avg99, stdDev74, stdDev99, amountList)) {
      satisfied = true;
    }

    return {
      code: 200,
      data: {
        satisfied,
        ma12,
        ma74,
        ma99,
        avg12,
        avg74,
        avg99,
        stdDev74,
        stdDev99,
        amountList,
      },
    };
  }
}
