import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ProjectCategoryTranslationDto } from './project-category-translation.dto';

export class CreateProjectCategoryDto {
  @ApiProperty({ description: 'Translations for the category', type: [ProjectCategoryTranslationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectCategoryTranslationDto)
  translations: ProjectCategoryTranslationDto[];

  @ApiProperty({ description: 'The color of the category' })
  @IsString()
  color: string;

  @ApiProperty({ description: 'The project ID' })
  @IsNumber()
  projectId: number;
}
