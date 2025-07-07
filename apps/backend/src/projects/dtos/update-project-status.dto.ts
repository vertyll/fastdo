import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ProjectStatusTranslationDto } from './project-status-translation.dto';

export class UpdateProjectStatusDto {
  @ApiProperty({ description: 'Translations for the status', required: false, type: [ProjectStatusTranslationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectStatusTranslationDto)
  translations?: ProjectStatusTranslationDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
