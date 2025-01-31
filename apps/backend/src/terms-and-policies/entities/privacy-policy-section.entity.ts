import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { LegalSectionType } from '../enums/legal-section-type.enum';
import { PrivacyPolicySectionTranslation } from './privacy-policy-section-translation.entity';
import { PrivacyPolicy } from './privacy-policy.entity';

@Entity('privacy_policy_section')
export class PrivacyPolicySection {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  order: number;

  @ApiProperty({ enum: LegalSectionType, enumName: 'LegalSectionType' })
  @Column({
    type: 'enum',
    enum: LegalSectionType,
  })
  type: LegalSectionType;

  @ApiProperty({ type: () => PrivacyPolicy })
  @ManyToOne(() => PrivacyPolicy, policy => policy.sections)
  privacyPolicy: Relation<PrivacyPolicy>;

  @ApiProperty({ type: () => PrivacyPolicySectionTranslation, isArray: true })
  @OneToMany(() => PrivacyPolicySectionTranslation, translation => translation.section, {
    cascade: true,
  })
  translations: Relation<PrivacyPolicySectionTranslation[]>;
}
