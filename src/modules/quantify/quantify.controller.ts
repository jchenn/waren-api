import { Controller, Get, Query } from '@nestjs/common';
import { DailyEntity } from 'src/common/entities/daily.entity';
import { QuantifyService } from './quantify.service';
import { getMA, getMaxArrayGapRate } from 'src/utils/math.util';
import * as ss from 'simple-statistics';
import * as dayjs from 'dayjs';

const TRACK_DAYS = 40; // 跟踪天数

// 标准差除以平均值,用于反映均线平稳程度. 数字越小，均线越平稳，筛选结果越少
// 0.038  三旺通信
const OFFSET_RATE = 0.04;

// 当天MA12突破比例. 数字越大，筛选结果越少
// 1.004 农业银行调整
const MIN_BREAK_RATE = 1.004;
const MAX_BREAK_RATE = 1.04; // MA12最大不超过多少幅度. 数字越小，筛选结果越少
const GAP_RATE = 0.04; // MA74与MA99的差值比例. 数字越小，筛选结果越少
@Controller('quantify')
export class QuantifyController {
  constructor(private readonly quantifyService: QuantifyService) {}

  async calculateMA(code: string, startDate: string) {
    const tradeList: DailyEntity[] =
      await this.quantifyService.getDailyTradeByCodeAndDate(
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
    };
  }

  checkSatisfy(
    ma12: number[],
    ma74: number[],
    ma99: number[],
    avg74: number,
    avg99: number,
    stdDev74: number,
    stdDev99: number,
  ): boolean {
    // 近2日涨幅
    const UP_DAY = 2;
    const up12 = ma12[0] / ma12[UP_DAY] - 1;
    const up74 = ma74[0] / ma74[UP_DAY] - 1;
    const up99 = ma99[0] / ma99[UP_DAY] - 1;

    // console.log('均线涨幅', up12 / Math.max(up74, up99));

    // console.log(up12, up74, up99);

    if (
      // 当前股价大于2.5
      ma12[0] >= 2.5 &&
      // 处于上升趋势
      // ma12[0] - ma12[2]  >= ma12[2] * 1.007 &&
      // 近3天MA12均线涨幅更快,有起飞的趋势
      up12 > 0 &&
      up74 >= -0.0015 &&
      up99 >= -0.0015 &&
      up12 / Math.max(up74, up99) >= 3 &&
      // MA12突破MA74和MA99,但还没起飞
      ma12[0] >= Math.min(ma74[0], ma99[0]) * MIN_BREAK_RATE &&
      ma12[0] <= Math.max(ma74[0], ma99[0]) * MAX_BREAK_RATE &&
      // MA74和MA99足够平稳
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
     * from_date 从指定日期往前计算，格式 YYYYMMDD，默认昨天
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
        const { ma12, ma74, ma99, stdDev74, avg74, stdDev99, avg99 } =
          await this.calculateMA(
            stock.code,
            params.from_date || dayjs().subtract(1, 'day').format('YYYYMMDD'),
          );

        if (
          this.checkSatisfy(ma12, ma74, ma99, avg74, avg99, stdDev74, stdDev99)
        ) {
          console.log('符合条件:', stock.code, stock.name);
          result.push({
            code: stock.code,
            name: stock.name,
          });
        }

        return result;
      }),
    );

    return {
      code: 200,
      data: result,
    };
  }

  @Get('strategy/ma/get/test')
  async getByMAStrategyTest() {
    // const code = '002079.SZ'; // 苏州固锝
    // const START_DATE = '20230321';
    // const code = '688618.SH'; // 三旺通信
    // const START_DATE = '20221028';
    const code = '601288.SH'; // 农业银行
    const START_DATE = '20221202';

    let satisfied = false;
    const { ma12, ma74, ma99, stdDev74, avg74, stdDev99, avg99 } =
      await this.calculateMA(code, START_DATE);

    // const maxGapRate = getMaxArrayGapRate(ma74, ma99);

    // console.log(ma12[0], ma74[0], ma99[0]);
    // console.log(stdDev74, avg74);
    // console.log(stdDev99, avg99);
    if (this.checkSatisfy(ma12, ma74, ma99, avg74, avg99, stdDev74, stdDev99)) {
      satisfied = true;
    }

    return {
      code: 200,
      data: {
        satisfied,
        ma12,
        ma74,
        ma99,
        stdDev74,
        avg74,
        stdDev99,
        avg99,
        // maxGapRate,
      },
    };
  }
}
