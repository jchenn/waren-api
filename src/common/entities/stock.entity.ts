import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('stock_basic')
export class StockEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  area: string;

  @Column({ nullable: true })
  industry: string;

  @Column()
  market: string;

  @Column()
  exchange: string;

  @Column({ name: 'curr_type' })
  currType: string;

  @Column({ name: 'list_status' })
  listStatus: string;

  @Column({ name: 'list_date' })
  listDate: string;

  @Column({ name: 'delist_date', nullable: true })
  delistDate: string;

  @Column({ name: 'is_hs', nullable: true })
  isHs: string;
}
