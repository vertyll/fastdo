import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Language } from '../../core/language/entities/language.entity';
import { ProjectCategory } from './project-category.entity';

@Entity('project_category_translation')
export class ProjectCategoryTranslation {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ length: 100 })
  name: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  description: string | null;

  @ApiProperty({ type: () => Language })
  @ManyToOne(() => Language, { eager: true })
  language: Relation<Language>;

  @ApiProperty({ type: () => ProjectCategory })
  @ManyToOne(() => ProjectCategory, category => category.translations, { onDelete: 'CASCADE' })
  projectCategory: Relation<ProjectCategory>;
}
