import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../database/entities/user.entity';
import { ExpertProfile } from '../database/entities/expert-profile.entity';
import { Post } from '../database/entities/post.entity';
import { CourseMaterial } from '../database/entities/course-material.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ExpertProfile, Post, CourseMaterial]),
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
