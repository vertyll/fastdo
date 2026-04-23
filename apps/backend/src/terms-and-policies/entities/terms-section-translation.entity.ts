import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Language } from '../../core/language/entities/language.entity';
import { TermsSection } from './terms-section.entity';

@Entity('terms_section_translation')
export class TermsSectionTranslation {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty()
  @Column()
  public title: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  public content: string | null;

  @ApiProperty()
  @Column({ type: 'simple-array', nullable: true })
  public items: string[] | null;

  @ApiProperty({ type: () => Language })
  @ManyToOne(() => Language, { eager: true })
  public language: Relation<Language>;

  @ApiProperty({ type: () => TermsSection })
  @ManyToOne(() => TermsSection, section => section.translations)
  public section: Relation<TermsSection>;
}
