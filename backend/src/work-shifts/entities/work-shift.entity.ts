import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('work_shifts')
export class WorkShift {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'employee_id' })
  employeeId: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'start_time', type: 'time without time zone' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time without time zone' })
  endTime: string;

  @Column({ name: 'role_shift', length: 100, nullable: true })
  roleShift: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'employee_id' })
  employee: User;
}
