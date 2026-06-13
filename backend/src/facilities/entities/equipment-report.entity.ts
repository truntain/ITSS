import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Equipment } from './equipment.entity';
import { User } from '../../users/entities/user.entity';

export type ReportStatus = 'pending' | 'in_progress' | 'resolved';

@Entity('equipment_reports')
export class EquipmentReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'equipment_id' })
  equipmentId: number;

  @Column({ name: 'reporter_id' })
  reporterId: number;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'pending',
  })
  status: ReportStatus;

  @CreateDateColumn({ name: 'reported_at', type: 'timestamp without time zone' })
  reportedAt: Date;

  @Column({ name: 'resolved_at', type: 'timestamp without time zone', nullable: true })
  resolvedAt?: Date;

  @ManyToOne(() => Equipment, (equipment) => equipment.reports)
  @JoinColumn({ name: 'equipment_id' })
  equipment: Equipment;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;
}
