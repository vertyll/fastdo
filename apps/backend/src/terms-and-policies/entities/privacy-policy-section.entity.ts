import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { LegalSectionTypeEnum } from '../enums/legal-section-type.enum';
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

  @ApiProperty({ enum: LegalSectionTypeEnum, enumName: 'LegalSectionType' })
  @Column({
    type: 'enum',
    enum: LegalSectionTypeEnum,
  })
  type: LegalSectionTypeEnum;

  @ApiProperty({ type: () => PrivacyPolicy })
  @ManyToOne(() => PrivacyPolicy, policy => policy.sections)
  privacyPolicy: Relation<PrivacyPolicy>;

  @ApiProperty({ type: () => PrivacyPolicySectionTranslation, isArray: true })
  @OneToMany(() => PrivacyPolicySectionTranslation, translation => translation.section, {
    cascade: true,
  })
  translations: Relation<PrivacyPolicySectionTranslation[]>;
}
