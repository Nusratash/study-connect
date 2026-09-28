import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';
import { User } from '../database/entities/user.entity';
import { CourseMaterial } from '../database/entities/course-material.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, CourseMaterial])],
  providers: [BookmarksService],
  controllers: [BookmarksController],
})
export class BookmarksModule {}
