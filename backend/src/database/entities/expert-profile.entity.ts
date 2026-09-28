import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('expert_profiles')
export class ExpertProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.expertProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column('text', { array: true, default: [] })
  expertise: string[];

  @Column({ type: 'text', nullable: true })
  credentials: string;

  @Column({ type: 'text', nullable: true })
  availability: string;

  @Column({ type: 'float', default: 0 })
  ratingAvg: number;

  @Column({ default: false })
  isApproved: boolean;
}
