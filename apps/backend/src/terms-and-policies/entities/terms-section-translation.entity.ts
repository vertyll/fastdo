import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Language } from '../../core/language/entities/language.entity';
import { TermsSection } from './terms-section.entity';

@Entity('terms_section_translation')
export class TermsSectionTranslation {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  content: string;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  items: string[];

  @ApiProperty({ type: () => Language })
  @ManyToOne(() => Language, { eager: true })
  language: Relation<Language>;

  @ApiProperty({ type: () => TermsSection })
  @ManyToOne(() => TermsSection, section => section.translations)
  section: Relation<TermsSection>;
}
