import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type FeedbackStatus = 'pending' | 'responded';

@Entity('feedbacks')
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'reply_content', type: 'text', nullable: true })
  replyContent?: string;

  @Column({ name: 'replier_id', nullable: true })
  replierId?: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  status: FeedbackStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @Column({ name: 'replied_at', type: 'timestamp without time zone', nullable: true })
  repliedAt?: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'replier_id' })
  replier?: User;
}
