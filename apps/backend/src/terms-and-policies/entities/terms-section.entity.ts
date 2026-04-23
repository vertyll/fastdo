import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { LegalSectionTypeEnum } from '../enums/legal-section-type.enum';
import { TermsSectionTranslation } from './terms-section-translation.entity';
import { Terms } from './terms.entity';

@Entity('terms_section')
export class TermsSection {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty()
  @Column()
  public order: number;

  @ApiProperty({
    enum: LegalSectionTypeEnum,
    enumName: 'LegalSectionTypeEnum',
  })
  @Column({
    type: 'enum',
    enum: LegalSectionTypeEnum,
  })
  public type: LegalSectionTypeEnum;

  @ApiProperty()
  @ManyToOne(() => Terms, terms => terms.sections)
  public terms: Relation<Terms>;

  @ApiProperty({ type: () => TermsSectionTranslation })
  @OneToMany(() => TermsSectionTranslation, translation => translation.section, {
    cascade: true,
  })
  public translations: Relation<TermsSectionTranslation[]>;
}
