import { ApiProperty } from '@nestjs/swagger';

export class TermsSectionTranslationDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  title: string;
  @ApiProperty({ nullable: true })
  content: string | null;
  @ApiProperty({ nullable: true })
  items: string[] | null;
  @ApiProperty()
  language: { id: number; code: string; name: string; };
}

export class TermsSectionDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  order: number;
  @ApiProperty()
  type: string;
  @ApiProperty({ type: [TermsSectionTranslationDto] })
  translations: TermsSectionTranslationDto[];
}

export class TermsDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  version: string;
  @ApiProperty()
  dateEffective: Date;
  @ApiProperty()
  dateCreation: Date;
  @ApiProperty()
  dateModification: Date | null;
  @ApiProperty({ type: [TermsSectionDto] })
  sections: TermsSectionDto[];
}
