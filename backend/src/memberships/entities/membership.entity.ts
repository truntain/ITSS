import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Package } from './package.entity';

export type MembershipStatus = 'active' | 'expired' | 'paused';

@Entity('memberships')
export class Membership {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'package_id', length: 50 })
  packageId: string;

  @Column({ name: 'voucher_code', length: 50, nullable: true })
  voucherCode?: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ name: 'total_sessions', type: 'integer', default: 0 })
  totalSessions: number;

  @Column({ name: 'remaining_sessions', type: 'integer', default: 0 })
  remainingSessions: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'active',
  })
  status: MembershipStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp without time zone' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Package, (pkg) => pkg.memberships)
  @JoinColumn({ name: 'package_id' })
  package: Package;
}
