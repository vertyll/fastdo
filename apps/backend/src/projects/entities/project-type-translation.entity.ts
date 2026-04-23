import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Language } from '../../core/language/entities/language.entity';
import { ProjectType } from './project-type.entity';

@Entity('project_type_translation')
export class ProjectTypeTranslation {
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

  @ApiProperty({ type: () => ProjectType })
  @ManyToOne(() => ProjectType, projectType => projectType.translations, { onDelete: 'CASCADE' })
  public projectType: Relation<ProjectType>;
}
