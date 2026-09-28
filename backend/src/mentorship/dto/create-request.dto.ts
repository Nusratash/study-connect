import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateMentorshipRequestDto {
  @IsUUID()
  expertId: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}
