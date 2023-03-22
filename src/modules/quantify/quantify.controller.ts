import { Controller, Get } from '@nestjs/common';
import { DailyEntity } from 'src/common/entities/daily.entity';
import { QuantifyService } from './quantify.service';
import { getMA } from 'src/utils/math.util';
import * as ss from 'simple-statistics';

@Controller('quantify')
export class QuantifyController {
  constructor(private readonly quantifyService: QuantifyService) {}

  @Get('strategy/ma/get')
  async getByMAStrategy() {
    const code = '601288.SH';
    const START_DATE = '20221201';
    const TRACK_DAYS = 40;
    const OFFSET_RATE = 0.08; // 数字越小，筛选结果越少
    const BREAK_RATE = 0.04; // 当天突破比例，数字越大，筛选结果越少

    const tradeList: DailyEntity[] =
      await this.quantifyService.getDailyTradeByCodeAndDate(
        code,
        START_DATE,
        TRACK_DAYS + 120,
      );

    console.log(tradeList.length);

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
      code: 200,
      data: {
        ma12,
        ma74,
        ma99,
        avg12,
        avg74,
        avg99,
        stdDev12,
        stdDev74,
        stdDev99,
        lastDay: {
          ma12: ma12[0],
          ma74: ma74[0],
          ma99: ma99[0],
        },
      },
    };
  }
}
