import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Language } from '../../core/language/entities/language.entity';
import { PrivacyPolicySection } from './privacy-policy-section.entity';

@Entity('privacy_policy_section_translation')
export class PrivacyPolicySectionTranslation {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  content: string | null;

  @ApiProperty()
  @Column({ type: 'simple-array', nullable: true })
  items: string[] | null;

  @ApiProperty({ type: () => Language })
  @ManyToOne(() => Language, { eager: true })
  language: Relation<Language>;

  @ApiProperty({ type: () => PrivacyPolicySection })
  @ManyToOne(() => PrivacyPolicySection, section => section.translations)
  section: Relation<PrivacyPolicySection>;
}
