import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { TermsSection } from './terms-section.entity';

@Entity('terms_section_translation')
export class TermsSectionTranslation {
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

  @ApiProperty({ type: () => TermsSection })
  @ManyToOne(() => TermsSection, section => section.translations)
  section: Relation<TermsSection>;
}
