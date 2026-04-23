import { ApiProperty } from '@nestjs/swagger';
import { TranslationDto } from '../../common/dtos/translation.dto';

export class ProjectRoleResponseDto {
  @ApiProperty()
  public readonly id: number;

  @ApiProperty({ type: [TranslationDto] })
  public readonly translations: TranslationDto[];
}
