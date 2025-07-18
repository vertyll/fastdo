import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Language } from '../../core/language/entities/language.entity';
import { ProjectStatus } from './project-status.entity';

@Entity('project_status_translation')
export class ProjectStatusTranslation {
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

  @ApiProperty({ type: () => ProjectStatus })
  @ManyToOne(() => ProjectStatus, status => status.translations, { onDelete: 'CASCADE' })
  projectStatus: Relation<ProjectStatus>;
}
