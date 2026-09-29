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
    const conversations = await this.conversationsRepo.find({
      where: [{ userOneId: userId }, { userTwoId: userId }],
      relations: ['userOne', 'userTwo'],
      order: { createdAt: 'DESC' },
    });

    // Shape each conversation for the current viewer: who the *other* person is,
    // the last message for a preview, and how many are unread.
    const summaries = await Promise.all(
      conversations.map(async (c) => {
        const otherUser = c.userOneId === userId ? c.userTwo : c.userOne;
        const [lastMessage] = await this.messagesRepo.find({
          where: { conversationId: c.id },
          order: { createdAt: 'DESC' },
          take: 1,
        });
        const unreadCount = await this.messagesRepo.count({
          where: { conversationId: c.id, isRead: false, senderId: otherUser.id },
        });
        return {
          id: c.id,
          createdAt: c.createdAt,
          otherUser,
          lastMessage: lastMessage || null,
          unreadCount,
        };
      }),
    );

    return summaries.sort((a, b) => {
      const at = a.lastMessage?.createdAt ?? a.createdAt;
      const bt = b.lastMessage?.createdAt ?? b.createdAt;
      return new Date(bt).getTime() - new Date(at).getTime();
    });
  }

  async getConversationMeta(conversationId: string, userId: string) {
    const conversation = await this.assertParticipant(conversationId, userId);
    const conv = await this.conversationsRepo.findOne({
      where: { id: conversation.id },
      relations: ['userOne', 'userTwo'],
    });
    const otherUser = conv.userOneId === userId ? conv.userTwo : conv.userOne;
    return { id: conv.id, otherUser };
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
