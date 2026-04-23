import { ApiProperty } from '@nestjs/swagger';
import { TranslationDto } from '../../common/dtos/translation.dto';

export class ProjectCategoryResponseDto {
  @ApiProperty()
  public readonly id: number;

  @ApiProperty()
  public readonly color: string;

  @ApiProperty({ type: [TranslationDto] })
  public readonly translations: TranslationDto[];
}
