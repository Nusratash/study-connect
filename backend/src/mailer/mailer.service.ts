import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { emailLayout } from './templates/email-layout';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: this.isConfigured()
        ? { user: process.env.SMTP_USER, pass: (process.env.SMTP_PASS || '').replace(/\s/g, '') }
        : undefined,
    });
  }

  private isConfigured() {
    return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.isConfigured()) {
      this.logger.warn(`SMTP not configured (set SMTP_USER and SMTP_PASS in .env). Email NOT sent -> To: ${to} | ${subject}`);
      return;
    }
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || `EduConnect <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err.message}`);
    }
  }

  async sendWelcomeEmail(to: string, name: string) {
    const html = emailLayout(
      'Welcome to EduConnect',
      `<p>Hi ${name},</p><p>Welcome to <strong>EduConnect</strong> — the place where students and experts connect, share knowledge and grow together.</p>`,
    );
    await this.send(to, 'Welcome to EduConnect 🎓', html);
  }

  async sendVerificationEmail(to: string, name: string, token: string) {
    const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    const html = emailLayout(
      'Verify your email',
      `<p>Hi ${name},</p><p>Please verify your email address to activate your account:</p>
       <p><a href="${link}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">Verify Email</a></p>
       <p>Or copy this link: ${link}</p>`,
    );
    await this.send(to, 'Verify your EduConnect email', html);
  }

  async sendPasswordResetEmail(to: string, name: string, token: string) {
    const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    this.logger.log(`Password reset link for ${to}: ${link}`); // handy during development
    const html = emailLayout(
      'Reset your password',
      `<p>Hi ${name},</p><p>We received a request to reset your password. This link expires in 30 minutes.</p>
       <p><a href="${link}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">Reset Password</a></p>`,
    );
    await this.send(to, 'Reset your EduConnect password', html);
  }

  async sendMentorshipRequestEmail(to: string, expertName: string, studentName: string) {
    const html = emailLayout(
      'New mentorship request',
      `<p>Hi ${expertName},</p><p><strong>${studentName}</strong> has requested mentorship from you. Log in to your dashboard to review and respond.</p>`,
    );
    await this.send(to, 'New mentorship request on EduConnect', html);
  }

  async sendMentorshipStatusEmail(
    to: string,
    studentName: string,
    expertName: string,
    status: 'accepted' | 'rejected',
  ) {
    const html = emailLayout(
      `Mentorship request ${status}`,
      `<p>Hi ${studentName},</p><p><strong>${expertName}</strong> has <strong>${status}</strong> your mentorship request.</p>`,
    );
    await this.send(to, `Your mentorship request was ${status}`, html);
  }

  async sendNewCommentEmail(to: string, authorName: string, postTitle: string) {
    const html = emailLayout(
      'New comment on your post',
      `<p>Hi ${authorName},</p><p>Someone replied to your post "<strong>${postTitle}</strong>". Check it out on EduConnect.</p>`,
    );
    await this.send(to, 'New comment on your post', html);
  }

  async sendUnreadMessagesDigest(to: string, name: string, count: number) {
    const html = emailLayout(
      'You have unread messages',
      `<p>Hi ${name},</p><p>You have ${count} unread message(s) waiting for you on EduConnect.</p>`,
    );
    await this.send(to, 'You have unread messages on EduConnect', html);
  }

  async sendWeeklyDigest(to: string, name: string, materialsCount: number, postsCount: number) {
    const html = emailLayout(
      'Your weekly EduConnect digest',
      `<p>Hi ${name},</p><p>This week: ${materialsCount} new materials and ${postsCount} trending posts. Log in to catch up.</p>`,
    );
    await this.send(to, 'Your weekly EduConnect digest', html);
  }
}
