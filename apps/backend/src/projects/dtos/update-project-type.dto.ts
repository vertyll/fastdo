import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { ProjectTypeTranslationDto } from './project-type-translation.dto';

export class UpdateProjectTypeDto {
  @ApiProperty({ description: 'Translations for the project type', required: false, type: [ProjectTypeTranslationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectTypeTranslationDto)
  translations?: ProjectTypeTranslationDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
