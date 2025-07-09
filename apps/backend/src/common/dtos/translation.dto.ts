import { ApiProperty } from '@nestjs/swagger';

export class TranslationDto {
  @ApiProperty()
  lang: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false, nullable: true })
  description?: string;
}
