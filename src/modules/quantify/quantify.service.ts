import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DailyEntity } from 'src/common/entities/daily.entity';
import { StockEntity } from 'src/common/entities/stock.entity';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';

@Injectable()
export class QuantifyService {
  @InjectRepository(DailyEntity)
  private readonly dailyRepository: Repository<DailyEntity>;

  @InjectRepository(StockEntity)
  private readonly stockRepository: Repository<StockEntity>;

  @Inject(CACHE_MANAGER)
  private readonly cacheManager: Cache;

  async getStockList(limit?: number) {
    const data = await this.stockRepository.find({
      select: ['code', 'name'],
      take: limit || undefined,
    });
    return data;
  }

  async getDailyTradeByCodeAndDate(code: string, tradeDate: string, limit: number) {
    // 优先从缓存中获取
    const MEM_KEY = `${code}_${tradeDate}`;
    const cachedData = await this.cacheManager.get(MEM_KEY);
    if (cachedData) {
      // console.log('[redis] cache hit:', MEM_KEY);
      return JSON.parse(cachedData as string);
    }

    const data = await this.dailyRepository
      .createQueryBuilder('daily')
      .select(['daily.tradeDate', 'daily.close', 'daily.amount'])
      .where('daily.code = :code', { code })
      .andWhere('daily.tradeDate <= :tradeDate', { tradeDate })
      .orderBy('daily.tradeDate', 'DESC')
      .limit(limit)
      .getMany();

    // 缓存数据，24小时过期
    await this.cacheManager.set(MEM_KEY, JSON.stringify(data), {
      ttl: 24 * 60 * 60,
    });
    return data;
  }
}
