import { IsEnum } from 'class-validator';
import { MentorshipStatus } from '../../common/enums/mentorship-status.enum';

export class RespondMentorshipRequestDto {
  @IsEnum([MentorshipStatus.ACCEPTED, MentorshipStatus.REJECTED])
  status: MentorshipStatus.ACCEPTED | MentorshipStatus.REJECTED;
}
