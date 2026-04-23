import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { TranslationDto } from '../../common/dtos/translation.dto';

export class CreateProjectCategoryDto {
  @ApiProperty({ description: 'Translations for the category', type: [TranslationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TranslationDto)
  public readonly translations: TranslationDto[];

  @ApiProperty({ description: 'The color of the category' })
  @IsString()
  public readonly color: string;

  @ApiProperty({ description: 'The project ID' })
  @IsNumber()
  public readonly projectId: number;
}
