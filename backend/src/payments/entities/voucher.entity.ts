import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type VoucherDiscountType = 'percent' | 'fixed';
export type VoucherStatus = 'active' | 'expired' | 'depleted';

@Entity('vouchers')
export class Voucher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({
    name: 'discount_type',
    type: 'varchar',
    length: 20,
  })
  discountType: VoucherDiscountType;

  @Column({ name: 'discount_value', type: 'numeric', precision: 12, scale: 2 })
  discountValue: number;

  @Column({ type: 'integer', default: 0 })
  used: number;

  @Column({ type: 'integer' })
  total: number;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'active',
  })
  status: VoucherStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;
}
