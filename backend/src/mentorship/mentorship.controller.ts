import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { MentorshipService } from './mentorship.service';
import { CreateMentorshipRequestDto } from './dto/create-request.dto';
import { RespondMentorshipRequestDto } from './dto/respond-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@UseGuards(JwtAuthGuard)
@Controller('mentorship')
export class MentorshipController {
  constructor(private mentorshipService: MentorshipService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  @Post('request')
  create(
    @CurrentUser('userId') studentId: string,
    @Body() dto: CreateMentorshipRequestDto,
  ) {
    return this.mentorshipService.create(studentId, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.EXPERT)
  @Patch(':id/respond')
  respond(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') expertId: string,
    @Body() dto: RespondMentorshipRequestDto,
  ) {
    return this.mentorshipService.respond(id, expertId, dto.status);
  }

  @Get('my-requests')
  myRequests(@CurrentUser() user: any) {
    return user.role === Role.EXPERT
      ? this.mentorshipService.findForExpert(user.userId)
      : this.mentorshipService.findForStudent(user.userId);
  }
}
