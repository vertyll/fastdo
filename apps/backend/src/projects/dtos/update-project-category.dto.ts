import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ProjectCategoryTranslationDto } from './project-category-translation.dto';

export class UpdateProjectCategoryDto {
  @ApiProperty({ description: 'Translations for the category', required: false, type: [ProjectCategoryTranslationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectCategoryTranslationDto)
  translations?: ProjectCategoryTranslationDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
