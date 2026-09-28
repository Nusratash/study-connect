import { Controller, Delete, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('bookmarks')
export class BookmarksController {
  constructor(private bookmarksService: BookmarksService) {}

  @Get()
  list(@CurrentUser('userId') userId: string) {
    return this.bookmarksService.list(userId);
  }

  @Post(':materialId')
  add(@CurrentUser('userId') userId: string, @Param('materialId', ParseUUIDPipe) materialId: string) {
    return this.bookmarksService.add(userId, materialId);
  }

  @Delete(':materialId')
  remove(@CurrentUser('userId') userId: string, @Param('materialId', ParseUUIDPipe) materialId: string) {
    return this.bookmarksService.remove(userId, materialId);
  }
}
