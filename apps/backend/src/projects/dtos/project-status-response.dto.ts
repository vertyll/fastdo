import { ApiProperty } from '@nestjs/swagger';
import { TranslationDto } from '../../common/dtos/translation.dto';

export class ProjectStatusResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  color: string;

  @ApiProperty({ type: [TranslationDto] })
  translations: TranslationDto[];
}
