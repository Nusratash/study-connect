import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { ExpertProfile } from './expert-profile.entity';
import { StudentProfile } from './student-profile.entity';
import { CourseMaterial } from './course-material.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  passwordHash: string;

  @Column({ type: 'enum', enum: Role, default: Role.STUDENT })
  role: Role;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true, select: false })
  verificationToken: string;

  @Column({ nullable: true, select: false })
  refreshTokenHash: string;

  @Column({ nullable: true, select: false })
  resetPasswordToken: string;

  @Column({ type: 'timestamp', nullable: true, select: false })
  resetPasswordExpires: Date;

  @OneToOne(() => ExpertProfile, (profile) => profile.user)
  expertProfile: ExpertProfile;

  @OneToOne(() => StudentProfile, (profile) => profile.user)
  studentProfile: StudentProfile;

  // Many-to-Many: users can bookmark many materials, a material can be bookmarked by many users
  @ManyToMany(() => CourseMaterial, (m) => m.bookmarkedBy)
  @JoinTable({ name: 'bookmarks' })
  bookmarkedMaterials: CourseMaterial[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
