import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Membership } from '../../memberships/entities/membership.entity';
import { Package } from '../../memberships/entities/package.entity';
import { Voucher } from './voucher.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'receipt_no', unique: true, length: 100 })
  receiptNo: string;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'membership_id' })
  membershipId: number;

  @Column({ name: 'package_id', length: 50 })
  packageId: string;

  @Column({ name: 'voucher_id', type: 'integer', nullable: true })
  voucherId?: number;

  @Column({ name: 'original_amount', type: 'numeric', precision: 12, scale: 2 })
  originalAmount: number;

  @Column({ name: 'discount_amount', type: 'numeric', precision: 12, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'final_amount', type: 'numeric', precision: 12, scale: 2 })
  finalAmount: number;

  @Column({ name: 'payment_method', length: 50 })
  paymentMethod: string;

  @Column({ name: 'cashier_id', type: 'integer', nullable: true })
  cashierId?: number;

  @CreateDateColumn({ name: 'transaction_date', type: 'timestamp without time zone' })
  transactionDate: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Membership)
  @JoinColumn({ name: 'membership_id' })
  membership: Membership;

  @ManyToOne(() => Package)
  @JoinColumn({ name: 'package_id' })
  package: Package;

  @ManyToOne(() => Voucher, { nullable: true })
  @JoinColumn({ name: 'voucher_id' })
  voucher?: Voucher;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'cashier_id' })
  cashier?: User;
}
