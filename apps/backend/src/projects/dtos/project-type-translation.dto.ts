import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ProjectTypeTranslationDto {
  @ApiProperty({ description: 'Language code', enum: ['pl', 'en'] })
  @IsString()
  languageCode: string;

  @ApiProperty({ description: 'The name of the project type' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'The description of the project type', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
