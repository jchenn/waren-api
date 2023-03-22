import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';
import { StockEntity } from './stock.entity';

@Entity('daily_trade')
export class DailyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn({ name: 'trade_date' })
  tradeDate: string;

  // @OneToMany(() => StockEntity, (stock) => stock.code)
  @PrimaryColumn()
  code: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  open: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  high: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  low: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  close: number;

  @Column({ name: 'pre_close', type: 'decimal', precision: 10, scale: 2 })
  preClose: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '涨跌额' })
  change: number;

  @Column({
    name: 'pct_chg',
    type: 'decimal',
    precision: 10,
    scale: 4,
    comment: '涨跌幅（%）',
  })
  pctChg: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '成交量（手）' })
  vol: number;

  @Column({
    type: 'decimal',
    precision: 13,
    scale: 3,
    comment: '成交额（千元）',
  })
  amount: number;
}
