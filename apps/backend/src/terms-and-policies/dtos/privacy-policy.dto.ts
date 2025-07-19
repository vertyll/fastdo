import { ApiProperty } from '@nestjs/swagger';

export class PrivacyPolicySectionTranslationDto {
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

export class PrivacyPolicySectionDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  order: number;
  @ApiProperty()
  type: string;
  @ApiProperty({ type: [PrivacyPolicySectionTranslationDto] })
  translations: PrivacyPolicySectionTranslationDto[];
}

export class PrivacyPolicyDto {
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
  @ApiProperty({ type: [PrivacyPolicySectionDto] })
  sections: PrivacyPolicySectionDto[];
}
