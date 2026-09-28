import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CourseMaterial } from '../database/entities/course-material.entity';
import { CreateMaterialDto } from './dto/create-material.dto';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(CourseMaterial)
    private materialsRepo: Repository<CourseMaterial>,
  ) {}

  async create(uploaderId: string, dto: CreateMaterialDto, fileUrl: string) {
    const material = this.materialsRepo.create({
      ...dto,
      uploaderId,
      fileUrl,
      tags: dto.tags || [],
      visibility: dto.visibility || 'public',
    });
    return this.materialsRepo.save(material);
  }

  async findAll(category?: string, search?: string) {
    const qb = this.materialsRepo
      .createQueryBuilder('material')
      .leftJoinAndSelect('material.uploader', 'uploader')
      .orderBy('material.createdAt', 'DESC');

    if (category) qb.andWhere('material.category = :category', { category });
    if (search) {
      qb.andWhere(
        '(material.title ILIKE :search OR material.description ILIKE :search OR material.tags::text ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    return qb.getMany();
  }

  async findOne(id: string) {
    const material = await this.materialsRepo.findOne({
      where: { id },
      relations: ['uploader'],
    });
    if (!material) throw new NotFoundException('Material not found');
    return material;
  }

  /** Full replace of an editable material record (PUT). */
  async replace(
    id: string,
    userId: string,
    isAdmin: boolean,
    dto: CreateMaterialDto,
  ) {
    const material = await this.findOne(id);
    if (material.uploaderId !== userId && !isAdmin) {
      throw new ForbiddenException('Not allowed to edit this material');
    }
    material.title = dto.title;
    material.description = dto.description || null;
    material.category = dto.category || null;
    material.tags = dto.tags || [];
    material.visibility = dto.visibility || 'public';
    return this.materialsRepo.save(material);
  }

  async remove(id: string, userId: string, isAdmin: boolean) {
    const material = await this.findOne(id);
    if (material.uploaderId !== userId && !isAdmin) {
      throw new ForbiddenException('Not allowed to delete this material');
    }
    await this.materialsRepo.remove(material);
    return { message: 'Material deleted' };
  }
}
