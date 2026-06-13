import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type UserRole = 'HV' | 'PT' | 'NV' | 'AD';
export type UserGender = 'male' | 'female' | 'other';
export type UserStatus = 'working' | 'leave' | 'quit';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  password?: string; // Mật khẩu đã hash bằng bcrypt

  @Column({
    type: 'varchar',
    length: 10,
  })
  role: UserRole;

  @Column({ name: 'full_name', length: 255 })
  fullName: string;

  @Column({ length: 15 })
  phone: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate?: Date;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  gender?: UserGender;

  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  height?: number;

  @Column({ length: 255, nullable: true })
  avatar?: string;

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'working' })
  status: UserStatus;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
