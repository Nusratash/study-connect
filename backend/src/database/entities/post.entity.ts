import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Comment } from './comment.entity';
import { PostStatus } from '../../common/enums/post-status.enum';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ name: 'author_id' })
  authorId: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column('text', { array: true, default: [] })
  tags: string[];

  @Column({ type: 'enum', enum: PostStatus, default: PostStatus.OPEN })
  status: PostStatus;

  @Column({ default: 0 })
  upvotes: number;

  @Column({ nullable: true })
  acceptedCommentId: string;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  // Not a DB column: populated per-request via loadRelationCountAndMap.
  commentCount?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
