import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SendMessageDto } from './dto/send-message.dto';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations')
  myConversations(@CurrentUser('userId') userId: string) {
    return this.chatService.findConversationsForUser(userId);
  }

  @Post('conversations/:otherUserId')
  startConversation(
    @CurrentUser('userId') userId: string,
    @Param('otherUserId', ParseUUIDPipe) otherUserId: string,
  ) {
    return this.chatService.getOrCreateConversation(userId, otherUserId);
  }

  @Get('conversations/:conversationId/messages')
  history(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.chatService.getHistory(conversationId, userId);
  }

  @Post('conversations/:conversationId/messages')
  sendMessage(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.saveMessage(conversationId, userId, dto.content);
  }
}
