import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type AttendanceStatus = 'none' | 'checked_in' | 'absent';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'pt_id' })
  ptId: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'time_slot', length: 50 })
  timeSlot: string;

  @Column({ length: 100, nullable: true })
  room?: string;

  @Column({ length: 100 })
  type: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  status: BookingStatus;

  @Column({
    name: 'attendance_status',
    type: 'varchar',
    length: 20,
    default: 'none',
  })
  attendanceStatus: AttendanceStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp without time zone' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'pt_id' })
  pt: User;
}
