import { ApiProperty } from '@nestjs/swagger';

export class PrivacyPolicySectionTranslationDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  title: string;
  @ApiProperty()
  content: string;
  @ApiProperty()
  items: string[];
  @ApiProperty()
  language: { id: number; code: string; name: string };
}

export class PrivacyPolicySectionWithTranslationsDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  order: number;
  @ApiProperty()
  type: string;
  @ApiProperty({ type: [PrivacyPolicySectionTranslationDto] })
  translations: PrivacyPolicySectionTranslationDto[];
}

export class PrivacyPolicyWithTranslationsDto {
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
  @ApiProperty({ type: [PrivacyPolicySectionWithTranslationsDto] })
  sections: PrivacyPolicySectionWithTranslationsDto[];
}
