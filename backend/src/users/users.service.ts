import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities/user.entity';
import { StudentProfile } from '../database/entities/student-profile.entity';
import { ExpertProfile } from '../database/entities/expert-profile.entity';
import { Role } from '../common/enums/role.enum';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(StudentProfile)
    private studentProfileRepo: Repository<StudentProfile>,
    @InjectRepository(ExpertProfile)
    private expertProfileRepo: Repository<ExpertProfile>,
  ) {}

  async findById(id: string) {
    const user = await this.usersRepo.findOne({
      where: { id },
      relations: ['studentProfile', 'expertProfile'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.findById(userId);

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.bio !== undefined) user.bio = dto.bio;
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl;
    await this.usersRepo.save(user);

    if (user.role === Role.STUDENT) {
      let profile = await this.studentProfileRepo.findOne({
        where: { userId },
      });
      if (!profile) {
        profile = this.studentProfileRepo.create({ userId });
      }
      if (dto.interests !== undefined) profile.interests = dto.interests;
      if (dto.educationLevel !== undefined)
        profile.educationLevel = dto.educationLevel;
      if (dto.goals !== undefined) profile.goals = dto.goals;
      await this.studentProfileRepo.save(profile);
    } else if (user.role === Role.EXPERT) {
      let profile = await this.expertProfileRepo.findOne({
        where: { userId },
      });
      if (!profile) {
        profile = this.expertProfileRepo.create({ userId });
      }
      if (dto.expertise !== undefined) profile.expertise = dto.expertise;
      if (dto.credentials !== undefined) profile.credentials = dto.credentials;
      if (dto.availability !== undefined)
        profile.availability = dto.availability;
      await this.expertProfileRepo.save(profile);
    }

    return this.findById(userId);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :userId', { userId })
      .getOne();
    if (!user || !(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    await this.usersRepo.update(userId, {
      passwordHash: await bcrypt.hash(dto.newPassword, 10),
    });
    return { message: 'Password updated' };
  }

  async listExperts(search?: string) {
    const qb = this.usersRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.expertProfile', 'expertProfile')
      .where('user.role = :role', { role: Role.EXPERT });

    if (search) {
      qb.andWhere(
        '(user.name ILIKE :search OR expertProfile.expertise::text ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    return qb.orderBy('expertProfile.ratingAvg', 'DESC').getMany();
  }

  async getPublicProfile(id: string) {
    return this.findById(id);
  }
}
