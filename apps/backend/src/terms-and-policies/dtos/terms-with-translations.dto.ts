import { ApiProperty } from '@nestjs/swagger';

export class TermsSectionTranslationDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  title: string;
  @ApiProperty()
  content: string;
  @ApiProperty()
  items: string[];
  @ApiProperty()
  language: { id: number; code: string; name: string; };
}

export class TermsSectionWithTranslationsDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  order: number;
  @ApiProperty()
  type: string;
  @ApiProperty({ type: [TermsSectionTranslationDto] })
  translations: TermsSectionTranslationDto[];
}

export class TermsWithTranslationsDto {
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
  @ApiProperty({ type: [TermsSectionWithTranslationsDto] })
  sections: TermsSectionWithTranslationsDto[];
}
