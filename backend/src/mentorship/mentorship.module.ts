import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MentorshipService } from './mentorship.service';
import { MentorshipController } from './mentorship.controller';
import { MentorshipRequest } from '../database/entities/mentorship-request.entity';
import { Conversation } from '../database/entities/conversation.entity';
import { User } from '../database/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MentorshipRequest, Conversation, User]),
    NotificationsModule,
    MailerModule,
  ],
  providers: [MentorshipService],
  controllers: [MentorshipController],
})
export class MentorshipModule {}
