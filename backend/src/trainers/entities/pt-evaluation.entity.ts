import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('pt_evaluations')
export class PtEvaluation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'pt_id' })
  ptId: number;

  @Column({ name: 'trainee_id' })
  traineeId: number;

  @Column({ type: 'integer' })
  score: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'evaluation_date', type: 'date' })
  evaluationDate: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'pt_id' })
  pt: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'trainee_id' })
  trainee: User;
}
