import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { ProjectStatusTranslation } from './project-status-translation.entity';
import { Project } from './project.entity';

@Entity('project_status')
export class ProjectStatus {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty()
  @Column({ type: 'varchar' })
  public color: string;

  @ApiProperty()
  @Column({ default: true })
  public isActive: boolean;

  @ApiProperty({ type: () => Project })
  @ManyToOne(() => Project, project => project.statuses, { onDelete: 'CASCADE' })
  public project: Relation<Project>;

  @ApiProperty({ type: () => ProjectStatusTranslation, isArray: true })
  @OneToMany(() => ProjectStatusTranslation, translation => translation.projectStatus, {
    cascade: true,
    eager: true,
  })
  public translations: Relation<ProjectStatusTranslation[]>;
}
