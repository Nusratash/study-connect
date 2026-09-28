import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';

import { User } from '../database/entities/user.entity';
import { StudentProfile } from '../database/entities/student-profile.entity';
import { ExpertProfile } from '../database/entities/expert-profile.entity';
import { Role } from '../common/enums/role.enum';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailerService } from '../mailer/mailer.service';
import {
  JWT_ACCESS_EXPIRES,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_EXPIRES,
  JWT_REFRESH_SECRET,
} from './jwt.constants';

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(StudentProfile) private studentProfileRepo: Repository<StudentProfile>,
    @InjectRepository(ExpertProfile) private expertProfileRepo: Repository<ExpertProfile>,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  private issueTokens(user: { id: string; email: string; role: Role }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload, { secret: JWT_ACCESS_SECRET, expiresIn: JWT_ACCESS_EXPIRES }),
      refreshToken: this.jwtService.sign(payload, { secret: JWT_REFRESH_SECRET, expiresIn: JWT_REFRESH_EXPIRES }),
    };
  }

  // Columns marked select:false must be requested explicitly.
  private findWithSecrets(field: string, value: string, secrets: string[]) {
    const qb = this.usersRepo.createQueryBuilder('user');
    secrets.forEach((s) => qb.addSelect(`user.${s}`));
    return qb.where(`user.${field} = :value`, { value }).getOne();
  }

  private sanitize(user: any) {
    const { passwordHash, refreshTokenHash, verificationToken, resetPasswordToken, resetPasswordExpires, ...rest } = user;
    return rest;
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.usersRepo.findOne({ where: { email } });
    if (existing) {
      throw new HttpException('Email already registered', HttpStatus.CONFLICT);
    }

    const verificationToken = randomBytes(32).toString('hex');
    const saved = await this.usersRepo.save(
      this.usersRepo.create({
        name: dto.name.trim(),
        email,
        passwordHash: await bcrypt.hash(dto.password, 10), // BCrypt
        role: dto.role,
        verificationToken,
      }),
    );

    if (dto.role === Role.STUDENT) {
      await this.studentProfileRepo.save(this.studentProfileRepo.create({ userId: saved.id, interests: [] }));
    } else {
      await this.expertProfileRepo.save(this.expertProfileRepo.create({ userId: saved.id, expertise: [] }));
    }

    // Emails never break registration
    this.mailerService.sendWelcomeEmail(saved.email, saved.name);
    this.mailerService.sendVerificationEmail(saved.email, saved.name, verificationToken);

    const tokens = this.issueTokens(saved);
    await this.usersRepo.update(saved.id, { refreshTokenHash: sha256(tokens.refreshToken) });
    return { user: this.sanitize(saved), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.findWithSecrets('email', dto.email.trim().toLowerCase(), ['passwordHash']);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const tokens = this.issueTokens(user);
    await this.usersRepo.update(user.id, { refreshTokenHash: sha256(tokens.refreshToken) });
    return { user: this.sanitize(user), ...tokens };
  }

  async verifyEmail(token: string) {
    const user = await this.findWithSecrets('verificationToken', token, ['verificationToken']);
    if (!user) throw new BadRequestException('Invalid or expired token');
    await this.usersRepo.update(user.id, { isVerified: true, verificationToken: null });
    return { message: 'Email verified successfully' };
  }

  async forgotPassword(email: string) {
    const generic = { message: 'If that email exists, a reset link was sent' };
    const user = await this.usersRepo.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user) return generic;

    const resetToken = randomBytes(32).toString('hex');
    await this.usersRepo.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: new Date(Date.now() + 30 * 60 * 1000), // 30 min
    });
    await this.mailerService.sendPasswordResetEmail(user.email, user.name, resetToken);
    return generic;
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.findWithSecrets('resetPasswordToken', token, ['resetPasswordToken', 'resetPasswordExpires']);
    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset link');
    }
    await this.usersRepo.update(user.id, {
      passwordHash: await bcrypt.hash(newPassword, 10),
      resetPasswordToken: null,
      resetPasswordExpires: null,
      refreshTokenHash: null,
    });
    return { message: 'Password reset successfully' };
  }

  async refresh(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, { secret: JWT_REFRESH_SECRET });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.findWithSecrets('id', payload.sub, ['refreshTokenHash']);
    if (!user || user.refreshTokenHash !== sha256(refreshToken)) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const tokens = this.issueTokens(user);
    await this.usersRepo.update(user.id, { refreshTokenHash: sha256(tokens.refreshToken) });
    return tokens;
  }

  async logout(userId: string) {
    await this.usersRepo.update(userId, { refreshTokenHash: null });
    return { message: 'Logged out' };
  }
}
