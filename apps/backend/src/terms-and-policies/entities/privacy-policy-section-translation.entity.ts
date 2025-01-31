import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { PrivacyPolicySection } from './privacy-policy-section.entity';

@Entity('privacy_policy_section_translation')
export class PrivacyPolicySectionTranslation {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  languageCode: string;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  content: string;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  items: string[];

  @ApiProperty({ type: () => PrivacyPolicySection })
  @ManyToOne(() => PrivacyPolicySection, section => section.translations)
  section: Relation<PrivacyPolicySection>;
}
