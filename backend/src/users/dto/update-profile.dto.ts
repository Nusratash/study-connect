import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  // Student-only
  @IsOptional()
  @IsArray()
  interests?: string[];

  @IsOptional()
  @IsString()
  educationLevel?: string;

  @IsOptional()
  @IsString()
  goals?: string;

  // Expert-only
  @IsOptional()
  @IsArray()
  expertise?: string[];

  @IsOptional()
  @IsString()
  credentials?: string;

  @IsOptional()
  @IsString()
  availability?: string;
}
