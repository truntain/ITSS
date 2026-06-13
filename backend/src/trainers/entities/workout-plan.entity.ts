import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('workout_plans')
export class WorkoutPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'pt_id' })
  ptId: number;

  @Column({ name: 'trainee_id' })
  traineeId: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb' })
  exercises: any;

  @Column({ name: 'assigned_date', type: 'date' })
  assignedDate: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'pt_id' })
  pt: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'trainee_id' })
  trainee: User;
}
