import { ApiProperty } from '@nestjs/swagger';

export class TermsSectionTranslationDto {
  @ApiProperty()
  public readonly id: number;
  @ApiProperty()
  public readonly title: string;
  @ApiProperty({ nullable: true })
  public readonly content: string | null;
  @ApiProperty({ nullable: true })
  public readonly items: string[] | null;
  @ApiProperty()
  public readonly language: { id: number; code: string; name: string };
}

export class TermsSectionDto {
  @ApiProperty()
  public readonly id: number;
  @ApiProperty()
  public readonly order: number;
  @ApiProperty()
  public readonly type: string;
  @ApiProperty({ type: [TermsSectionTranslationDto] })
  public readonly translations: TermsSectionTranslationDto[];
}

export class TermsDto {
  @ApiProperty()
  public readonly id: number;
  @ApiProperty()
  public readonly version: string;
  @ApiProperty()
  public readonly dateEffective: Date;
  @ApiProperty()
  public readonly dateCreation: Date;
  @ApiProperty()
  public readonly dateModification: Date | null;
  @ApiProperty({ type: [TermsSectionDto] })
  public readonly sections: TermsSectionDto[];
}
