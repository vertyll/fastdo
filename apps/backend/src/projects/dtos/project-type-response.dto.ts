import { ApiProperty } from '@nestjs/swagger';
import { TranslationDto } from '../../common/dtos/translation.dto';

export class ProjectTypeResponseDto {
  @ApiProperty()
  public readonly id: number;

  @ApiProperty({ type: [TranslationDto] })
  public readonly translations: TranslationDto[];
}
