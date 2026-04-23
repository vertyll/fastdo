import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Language } from '../../core/language/entities/language.entity';
import { ProjectCategory } from './project-category.entity';

@Entity('project_category_translation')
export class ProjectCategoryTranslation {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty()
  @Column({ length: 100 })
  public name: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  public description: string | null;

  @ApiProperty({ type: () => Language })
  @ManyToOne(() => Language, { eager: true })
  public language: Relation<Language>;

  @ApiProperty({ type: () => ProjectCategory })
  @ManyToOne(() => ProjectCategory, category => category.translations, { onDelete: 'CASCADE' })
  public projectCategory: Relation<ProjectCategory>;
}
