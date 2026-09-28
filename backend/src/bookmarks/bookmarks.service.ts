import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { CourseMaterial } from '../database/entities/course-material.entity';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(CourseMaterial) private materialsRepo: Repository<CourseMaterial>,
  ) {}

  private async loadUser(userId: string) {
    return this.usersRepo.findOneOrFail({
      where: { id: userId },
      relations: ['bookmarkedMaterials'],
    });
  }

  // READ: list my bookmarked materials
  async list(userId: string) {
    const user = await this.loadUser(userId);
    return user.bookmarkedMaterials;
  }

  // CREATE: add a bookmark
  async add(userId: string, materialId: string) {
    const material = await this.materialsRepo.findOne({ where: { id: materialId } });
    if (!material) throw new NotFoundException('Material not found');

    const user = await this.loadUser(userId);
    if (user.bookmarkedMaterials.some((m) => m.id === materialId)) {
      throw new HttpException('Material already bookmarked', HttpStatus.CONFLICT);
    }
    user.bookmarkedMaterials.push(material);
    await this.usersRepo.save(user);
    return { message: 'Bookmarked', materialId };
  }

  // DELETE: remove a bookmark
  async remove(userId: string, materialId: string) {
    const user = await this.loadUser(userId);
    user.bookmarkedMaterials = user.bookmarkedMaterials.filter((m) => m.id !== materialId);
    await this.usersRepo.save(user);
    return { message: 'Bookmark removed', materialId };
  }
}
