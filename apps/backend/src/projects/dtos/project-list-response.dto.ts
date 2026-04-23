import { ApiProperty } from '@nestjs/swagger';
import { TranslationDto } from 'src/common/dtos/translation.dto';

export class ProjectListResponseDto {
  @ApiProperty()
  public readonly id: number;

  @ApiProperty()
  public readonly name: string;

  @ApiProperty({ required: false })
  public readonly description?: string | null;

  @ApiProperty()
  public readonly isPublic: boolean;

  @ApiProperty({ required: false, type: () => Object, nullable: true, example: { url: 'https://...' } })
  public readonly icon?: { url: string | null } | null;

  @ApiProperty()
  public readonly isActive: boolean;

  @ApiProperty()
  public readonly dateCreation: Date;

  @ApiProperty({ required: false })
  public readonly dateModification?: Date | null;

  @ApiProperty({ required: false })
  public readonly type?: {
    id: number;
    code: string;
    translations: TranslationDto[];
  };

  @ApiProperty({ type: [Object], required: false })
  public readonly categories?: Array<{ id: number; translations: TranslationDto[] }>;

  @ApiProperty({ type: [Object], required: false })
  public readonly statuses?: Array<{ id: number; translations: TranslationDto[] }>;

  @ApiProperty({ type: [String], required: false })
  public readonly permissions?: string[];
}
