import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ProjectStatusTranslationDto {
  @ApiProperty({ description: 'Language code', enum: ['pl', 'en'] })
  @IsString()
  languageCode: string;

  @ApiProperty({ description: 'The name of the status' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'The description of the status', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
