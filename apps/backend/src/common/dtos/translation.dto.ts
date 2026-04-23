import { ApiProperty } from '@nestjs/swagger';

export class TranslationDto {
  @ApiProperty()
  public readonly lang: string;

  @ApiProperty()
  public readonly name: string;

  @ApiProperty({ required: false, nullable: true })
  public readonly description?: string | null;
}
