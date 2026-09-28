import { ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MentorshipRequest } from '../database/entities/mentorship-request.entity';
import { Conversation } from '../database/entities/conversation.entity';
import { User } from '../database/entities/user.entity';
import { MentorshipStatus } from '../common/enums/mentorship-status.enum';
import { NotificationType } from '../common/enums/notification-type.enum';
import { CreateMentorshipRequestDto } from './dto/create-request.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class MentorshipService {
  constructor(
    @InjectRepository(MentorshipRequest)
    private requestsRepo: Repository<MentorshipRequest>,
    @InjectRepository(Conversation)
    private conversationsRepo: Repository<Conversation>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    private notificationsService: NotificationsService,
    private mailerService: MailerService,
  ) {}

  async create(studentId: string, dto: CreateMentorshipRequestDto) {
    const expert = await this.usersRepo.findOne({ where: { id: dto.expertId } });
    if (!expert || expert.role !== 'expert') throw new NotFoundException('Expert not found');

    const pending = await this.requestsRepo.findOne({
      where: { studentId, expertId: dto.expertId, status: MentorshipStatus.PENDING },
    });
    if (pending) throw new HttpException('You already have a pending request with this expert', HttpStatus.CONFLICT);

    const student = await this.usersRepo.findOne({ where: { id: studentId } });

    const request = this.requestsRepo.create({
      studentId,
      expertId: dto.expertId,
      message: dto.message,
    });
    const saved = await this.requestsRepo.save(request);

    await this.notificationsService.create(
      dto.expertId,
      NotificationType.MENTORSHIP_REQUEST,
      `${student.name} requested mentorship from you`,
      `/dashboard/expert/requests`,
    );
    await this.mailerService.sendMentorshipRequestEmail(
      expert.email,
      expert.name,
      student.name,
    );

    return saved;
  }

  async respond(
    requestId: string,
    expertId: string,
    status: MentorshipStatus.ACCEPTED | MentorshipStatus.REJECTED,
  ) {
    const request = await this.requestsRepo.findOne({
      where: { id: requestId },
      relations: ['student', 'expert'],
    });
    if (!request) throw new NotFoundException('Request not found');
    if (request.expertId !== expertId) {
      throw new ForbiddenException('Not your request to respond to');
    }

    request.status = status;
    const saved = await this.requestsRepo.save(request);

    const notifType =
      status === MentorshipStatus.ACCEPTED
        ? NotificationType.MENTORSHIP_ACCEPTED
        : NotificationType.MENTORSHIP_REJECTED;

    await this.notificationsService.create(
      request.studentId,
      notifType,
      `${request.expert.name} ${status} your mentorship request`,
      `/dashboard/student/my-requests`,
    );
    await this.mailerService.sendMentorshipStatusEmail(
      request.student.email,
      request.student.name,
      request.expert.name,
      status,
    );

    if (status === MentorshipStatus.ACCEPTED) {
      const existing = await this.conversationsRepo.findOne({
        where: [
          { userOneId: request.studentId, userTwoId: request.expertId },
          { userOneId: request.expertId, userTwoId: request.studentId },
        ],
      });
      if (!existing) {
        await this.conversationsRepo.save(
          this.conversationsRepo.create({
            userOneId: request.studentId,
            userTwoId: request.expertId,
          }),
        );
      }
    }

    return saved;
  }

  async findForStudent(studentId: string) {
    return this.requestsRepo.find({
      where: { studentId },
      relations: ['expert'],
      order: { createdAt: 'DESC' },
    });
  }

  async findForExpert(expertId: string) {
    return this.requestsRepo.find({
      where: { expertId },
      relations: ['student'],
      order: { createdAt: 'DESC' },
    });
  }
}
