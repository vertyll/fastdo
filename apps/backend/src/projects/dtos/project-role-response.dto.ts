import { ApiProperty } from '@nestjs/swagger';
import { TranslationDto } from '../../common/dtos/translation.dto';

export class ProjectRoleResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ type: [TranslationDto] })
  translations: TranslationDto[];
}
