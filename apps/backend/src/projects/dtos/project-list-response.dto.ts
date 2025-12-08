import { ApiProperty } from '@nestjs/swagger';
import { TranslationDto } from 'src/common/dtos/translation.dto';

export class ProjectListResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string | null;

  @ApiProperty()
  isPublic: boolean;

  @ApiProperty({ required: false, type: () => Object, nullable: true, example: { url: 'https://...' } })
  icon?: { url: string | null } | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  dateCreation: Date;

  @ApiProperty({ required: false })
  dateModification?: Date | null;

  @ApiProperty({ required: false })
  type?: {
    id: number;
    code: string;
    translations: TranslationDto[];
  };

  @ApiProperty({ type: [Object], required: false })
  categories?: Array<{ id: number; translations: TranslationDto[] }>;

  @ApiProperty({ type: [Object], required: false })
  statuses?: Array<{ id: number; translations: TranslationDto[] }>;

  @ApiProperty({ type: [String], required: false })
  permissions?: string[];
}
