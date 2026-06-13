import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Facility } from './facility.entity';
import { EquipmentReport } from './equipment-report.entity';

export type EquipmentStatus = 'active' | 'maintenance' | 'broken';

@Entity('equipment')
export class Equipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'facility_id' })
  facilityId: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'active',
  })
  status: EquipmentStatus;

  @Column({ name: 'last_maintenance', type: 'date', nullable: true })
  lastMaintenance?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp without time zone' })
  updatedAt: Date;

  @ManyToOne(() => Facility, (facility) => facility.equipment)
  @JoinColumn({ name: 'facility_id' })
  facility: Facility;

  @OneToMany(() => EquipmentReport, (report) => report.equipment)
  reports: EquipmentReport[];
}
