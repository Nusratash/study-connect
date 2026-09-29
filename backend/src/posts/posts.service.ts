import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../database/entities/post.entity';
import { Comment } from '../database/entities/comment.entity';
import { User } from '../database/entities/user.entity';
import { PostStatus } from '../common/enums/post-status.enum';
import { NotificationType } from '../common/enums/notification-type.enum';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepo: Repository<Post>,
    @InjectRepository(Comment) private commentsRepo: Repository<Comment>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    private notificationsService: NotificationsService,
    private mailerService: MailerService,
  ) {}

  async create(authorId: string, dto: CreatePostDto) {
    const post = this.postsRepo.create({
      ...dto,
      authorId,
      tags: dto.tags || [],
    });
    return this.postsRepo.save(post);
  }

  async findAll(tag?: string, status?: PostStatus) {
    const qb = this.postsRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .loadRelationCountAndMap('post.commentCount', 'post.comments')
      .orderBy('post.createdAt', 'DESC');

    if (tag) qb.andWhere(':tag = ANY(post.tags)', { tag });
    if (status) qb.andWhere('post.status = :status', { status });
    return qb.getMany();
  }

  async findOne(id: string) {
    const post = await this.postsRepo.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) throw new NotFoundException('Post not found');

    const comments = await this.commentsRepo.find({
      where: { postId: id },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });
    return { ...post, comments };
  }

  async upvote(id: string) {
    const post = await this.postsRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    post.upvotes += 1;
    return this.postsRepo.save(post);
  }

  async addComment(postId: string, authorId: string, dto: CreateCommentDto) {
    const post = await this.postsRepo.findOne({
      where: { id: postId },
      relations: ['author'],
    });
    if (!post) throw new NotFoundException('Post not found');

    const comment = this.commentsRepo.create({
      postId,
      authorId,
      content: dto.content,
    });
    const saved = await this.commentsRepo.save(comment);

    if (post.authorId !== authorId) {
      const commenter = await this.usersRepo.findOne({ where: { id: authorId } });
      const authorName = commenter?.name || 'Someone';
      await this.notificationsService.create(
        post.authorId,
        NotificationType.NEW_COMMENT,
        `${authorName} replied to your post "${post.title}"`,
        `/community/${post.id}`,
      );
      if (post.author?.email) {
        await this.mailerService.sendNewCommentEmail(
          post.author.email,
          post.author.name,
          post.title,
        );
      }
    }
    return saved;
  }

  /** Full replace of a post's editable fields (PUT). Author-only. */
  async replace(postId: string, userId: string, dto: CreatePostDto) {
    const post = await this.postsRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) {
      // Explicit HttpException example (in addition to the Nest shorthand
      // exceptions used elsewhere, which also extend HttpException).
      throw new HttpException(
        'Only the author can edit this post',
        HttpStatus.FORBIDDEN,
      );
    }
    post.title = dto.title;
    post.content = dto.content;
    post.tags = dto.tags || [];
    return this.postsRepo.save(post);
  }

  async markResolved(postId: string, userId: string, commentId: string) {
    const post = await this.postsRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) {
      throw new ForbiddenException('Only the author can mark a post resolved');
    }
    post.status = PostStatus.RESOLVED;
    post.acceptedCommentId = commentId;
    return this.postsRepo.save(post);
  }
}
