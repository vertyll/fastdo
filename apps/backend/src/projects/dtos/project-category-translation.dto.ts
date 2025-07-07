import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ProjectCategoryTranslationDto {
  @ApiProperty({ description: 'Language code', enum: ['pl', 'en'] })
  @IsString()
  languageCode: string;

  @ApiProperty({ description: 'The name of the category' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'The description of the category', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
