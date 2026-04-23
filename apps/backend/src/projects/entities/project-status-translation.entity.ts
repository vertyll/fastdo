import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Language } from '../../core/language/entities/language.entity';
import { ProjectStatus } from './project-status.entity';

@Entity('project_status_translation')
export class ProjectStatusTranslation {
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

  @ApiProperty({ type: () => ProjectStatus })
  @ManyToOne(() => ProjectStatus, status => status.translations, { onDelete: 'CASCADE' })
  public projectStatus: Relation<ProjectStatus>;
}
