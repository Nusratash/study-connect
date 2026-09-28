import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post as HttpPost,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PostStatus } from '../common/enums/post-status.enum';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  // GET /posts?tag=&status=  -> list (SSR-friendly, public)
  @Get()
  findAll(@Query('tag') tag?: string, @Query('status') status?: PostStatus) {
    return this.postsService.findAll(tag, status);
  }

  // GET /posts/:id -> single post + comments
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.findOne(id);
  }

  // POST /posts -> create
  @UseGuards(JwtAuthGuard)
  @HttpPost()
  create(@CurrentUser('userId') userId: string, @Body() dto: CreatePostDto) {
    return this.postsService.create(userId, dto);
  }

  // PUT /posts/:id -> full replace (author only)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  replace(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreatePostDto,
  ) {
    return this.postsService.replace(id, userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpPost(':id/upvote')
  upvote(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.upvote(id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpPost(':id/comments')
  addComment(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
    @Body() dto: CreateCommentDto,
  ) {
    return this.postsService.addComment(id, user.userId, dto);
  }

  // PATCH /posts/:id/resolve/:commentId -> partial update (status + accepted answer)
  @UseGuards(JwtAuthGuard)
  @Patch(':id/resolve/:commentId')
  resolve(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.postsService.markResolved(id, userId, commentId);
  }
}
