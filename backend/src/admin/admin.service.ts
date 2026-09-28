import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { ExpertProfile } from '../database/entities/expert-profile.entity';
import { Post } from '../database/entities/post.entity';
import { CourseMaterial } from '../database/entities/course-material.entity';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(ExpertProfile)
    private expertProfileRepo: Repository<ExpertProfile>,
    @InjectRepository(Post) private postsRepo: Repository<Post>,
    @InjectRepository(CourseMaterial)
    private materialsRepo: Repository<CourseMaterial>,
  ) {}

  async listUsers() {
    return this.usersRepo.find({ order: { createdAt: 'DESC' } });
  }

  async approveExpert(userId: string) {
    const profile = await this.expertProfileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Expert profile not found');
    profile.isApproved = true;
    return this.expertProfileRepo.save(profile);
  }

  async deleteUser(userId: string) {
    await this.usersRepo.delete({ id: userId });
    return { message: 'User deleted' };
  }

  async deletePost(postId: string) {
    await this.postsRepo.delete({ id: postId });
    return { message: 'Post deleted' };
  }

  async deleteMaterial(materialId: string) {
    await this.materialsRepo.delete({ id: materialId });
    return { message: 'Material deleted' };
  }

  async analytics() {
    const [totalUsers, totalStudents, totalExperts, totalPosts, resolvedPosts, totalMaterials] =
      await Promise.all([
        this.usersRepo.count(),
        this.usersRepo.count({ where: { role: Role.STUDENT } }),
        this.usersRepo.count({ where: { role: Role.EXPERT } }),
        this.postsRepo.count(),
        this.postsRepo.count({ where: { status: 'resolved' as any } }),
        this.materialsRepo.count(),
      ]);

    return {
      totalUsers,
      totalStudents,
      totalExperts,
      totalPosts,
      resolvedPosts,
      totalMaterials,
    };
  }
}
