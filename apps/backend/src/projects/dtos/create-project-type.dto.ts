import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ProjectTypeTranslationDto } from './project-type-translation.dto';

export class CreateProjectTypeDto {
  @ApiProperty({ description: 'Translations for the project type', type: [ProjectTypeTranslationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectTypeTranslationDto)
  translations: ProjectTypeTranslationDto[];
}
