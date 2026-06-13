import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn, OneToMany } from 'typeorm';
import { Membership } from './membership.entity';

@Entity('packages')
export class Package {
  @PrimaryColumn({ length: 50 })
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 50 })
  type: string;

  @Column({ name: 'duration_months', type: 'integer' })
  durationMonths: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'jsonb' })
  benefits: any;

  @Column({ name: 'is_visible', default: true })
  isVisible: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp without time zone' })
  updatedAt: Date;

  @OneToMany(() => Membership, (membership) => membership.package)
  memberships: Membership[];
}
