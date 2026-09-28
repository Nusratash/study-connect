import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../database/entities/user.entity';
import { StudentProfile } from '../database/entities/student-profile.entity';
import { ExpertProfile } from '../database/entities/expert-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, StudentProfile, ExpertProfile])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
