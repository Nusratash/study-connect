import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../database/entities/notification.entity';
import { NotificationType } from '../common/enums/notification-type.enum';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepo: Repository<Notification>,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    content: string,
    link?: string,
  ) {
    const notification = this.notificationsRepo.create({
      userId,
      type,
      content,
      link,
    });
    return this.notificationsRepo.save(notification);
  }

  async findForUser(userId: string) {
    return this.notificationsRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markAsRead(id: string, userId: string) {
    await this.notificationsRepo.update({ id, userId }, { isRead: true });
    return { message: 'Marked as read' };
  }

  async markAllAsRead(userId: string) {
    await this.notificationsRepo.update({ userId, isRead: false }, { isRead: true });
    return { message: 'All marked as read' };
  }
}
