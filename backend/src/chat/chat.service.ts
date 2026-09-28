import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../database/entities/conversation.entity';
import { Message } from '../database/entities/message.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../common/enums/notification-type.enum';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationsRepo: Repository<Conversation>,
    @InjectRepository(Message) private messagesRepo: Repository<Message>,
    private notificationsService: NotificationsService,
  ) {}

  async findConversationsForUser(userId: string) {
    return this.conversationsRepo.find({
      where: [{ userOneId: userId }, { userTwoId: userId }],
      relations: ['userOne', 'userTwo'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrCreateConversation(userOneId: string, userTwoId: string) {
    let conversation = await this.conversationsRepo.findOne({
      where: [
        { userOneId, userTwoId },
        { userOneId: userTwoId, userTwoId: userOneId },
      ],
    });
    if (!conversation) {
      conversation = await this.conversationsRepo.save(
        this.conversationsRepo.create({ userOneId, userTwoId }),
      );
    }
    return conversation;
  }

  async assertParticipant(conversationId: string, userId: string) {
    const conversation = await this.conversationsRepo.findOne({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.userOneId !== userId && conversation.userTwoId !== userId) {
      throw new ForbiddenException('Not a participant of this conversation');
    }
    return conversation;
  }

  async getHistory(conversationId: string, userId: string) {
    await this.assertParticipant(conversationId, userId);
    return this.messagesRepo.find({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  async saveMessage(conversationId: string, senderId: string, content: string) {
    const conversation = await this.assertParticipant(conversationId, senderId);
    const message = await this.messagesRepo.save(
      this.messagesRepo.create({ conversationId, senderId, content }),
    );

    const recipientId =
      conversation.userOneId === senderId
        ? conversation.userTwoId
        : conversation.userOneId;

    await this.notificationsService.create(
      recipientId,
      NotificationType.NEW_MESSAGE,
      'You have a new message',
      `/chat/${conversationId}`,
    );

    return message;
  }

  async markRead(conversationId: string, userId: string) {
    await this.assertParticipant(conversationId, userId);
    await this.messagesRepo.update(
      { conversationId, isRead: false },
      { isRead: true },
    );
    return { message: 'Marked as read' };
  }
}
