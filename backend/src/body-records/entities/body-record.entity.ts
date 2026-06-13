import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('body_records')
export class BodyRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'pt_id', nullable: true })
  ptId?: number;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  weight: number;

  @Column({ name: 'body_fat', type: 'numeric', precision: 4, scale: 2 })
  bodyFat: number;

  @Column({ name: 'muscle_mass', type: 'numeric', precision: 4, scale: 2, nullable: true })
  muscleMass?: number;

  @Column({ name: 'recorded_date', type: 'date' })
  recordedDate: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'pt_id' })
  pt?: User;
}
