import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { User } from './user.entity';

@Entity('course_materials')
export class CourseMaterial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'uploader_id' })
  uploader: User;

  @Column({ name: 'uploader_id' })
  uploaderId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  fileUrl: string;

  @Column({ nullable: true })
  category: string;

  @Column('text', { array: true, default: [] })
  tags: string[];

  @Column({ default: 'public' })
  visibility: 'public' | 'students' | 'private';

  @ManyToMany(() => User, (u) => u.bookmarkedMaterials)
  bookmarkedBy: User[];

  @CreateDateColumn()
  createdAt: Date;
}
