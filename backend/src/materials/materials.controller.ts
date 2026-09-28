import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('materials')
export class MaterialsController {
  constructor(private materialsService: MaterialsService) {}

  // GET /materials?category=&search=  -> list (SSR-friendly, public)
  @Get()
  findAll(@Query('category') category?: string, @Query('search') search?: string) {
    return this.materialsService.findAll(category, search);
  }

  // GET /materials/:id -> single record
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.materialsService.findOne(id);
  }

  // POST /materials -> create (multipart upload)
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOAD_DIR || './uploads',
        filename: (_req, file, cb) => {
          const unique = uuid();
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
    }),
  )
  create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateMaterialDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const fileUrl = file ? `/uploads/${file.filename}` : null;
    return this.materialsService.create(userId, dto, fileUrl);
  }

  // PUT /materials/:id -> full replace of editable fields
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  replace(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
    @Body() dto: CreateMaterialDto,
  ) {
    return this.materialsService.replace(id, user.userId, user.role === 'admin', dto);
  }

  // DELETE /materials/:id
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.materialsService.remove(id, user.userId, user.role === 'admin');
  }
}
