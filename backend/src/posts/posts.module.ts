import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from '../database/entities/post.entity';
import { Comment } from '../database/entities/comment.entity';
import { User } from '../database/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Comment, User]),
    NotificationsModule,
    MailerModule,
  ],
  providers: [PostsService],
  controllers: [PostsController],
})
export class PostsModule {}
