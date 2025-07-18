import { ApiProperty } from '@nestjs/swagger';
import { TranslationDto } from '../../common/dtos/translation.dto';

export class ProjectTypeResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ type: [TranslationDto] })
  translations: TranslationDto[];
}
