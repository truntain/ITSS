import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('checkins')
export class Checkin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @CreateDateColumn({ name: 'checked_in_at', type: 'timestamp without time zone' })
  checkedInAt: Date;

  @Column({ name: 'checked_in_by', nullable: true })
  checkedInBy?: number;

  @Column({ name: 'checkin_method', length: 50, default: 'QR_member' })
  checkinMethod: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'checked_in_by' })
  staff?: User;
}
