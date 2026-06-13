import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('gym_settings')
export class GymSetting {
  @PrimaryColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ length: 255, nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ name: 'open_time', length: 10, nullable: true })
  openTime?: string;

  @Column({ name: 'close_time', length: 10, nullable: true })
  closeTime?: string;

  @Column({ type: 'text', nullable: true })
  logo?: string;
}
