import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ProjectStatusTranslationDto } from './project-status-translation.dto';

export class CreateProjectStatusDto {
  @ApiProperty({ description: 'Translations for the status', type: [ProjectStatusTranslationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectStatusTranslationDto)
  translations: ProjectStatusTranslationDto[];

  @ApiProperty({ description: 'The color of the status' })
  @IsString()
  color: string;

  @ApiProperty({ description: 'The project ID' })
  @IsNumber()
  projectId: number;
}
