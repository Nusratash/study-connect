import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialsService } from './materials.service';
import { MaterialsController } from './materials.controller';
import { CourseMaterial } from '../database/entities/course-material.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseMaterial])],
  providers: [MaterialsService],
  controllers: [MaterialsController],
})
export class MaterialsModule {}
