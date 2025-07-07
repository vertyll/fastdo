import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { ProjectStatusTranslation } from './project-status-translation.entity';
import { Project } from './project.entity';

@Entity('project_status')
export class ProjectStatus {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: 'varchar' })
  color: string;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ type: () => Project })
  @ManyToOne(() => Project, project => project.statuses, { onDelete: 'CASCADE' })
  project: Relation<Project>;

  @ApiProperty({ type: () => ProjectStatusTranslation, isArray: true })
  @OneToMany(() => ProjectStatusTranslation, translation => translation.projectStatus, {
    cascade: true,
    eager: true,
  })
  translations: Relation<ProjectStatusTranslation[]>;
}
