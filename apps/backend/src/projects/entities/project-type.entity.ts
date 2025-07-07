import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { ProjectTypeTranslation } from './project-type-translation.entity';
import { Project } from './project.entity';

@Entity('project_type')
export class ProjectType {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ unique: true })
  code: string;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ type: () => Project })
  @OneToMany(() => Project, project => project.type)
  projects: Relation<Project[]>;

  @ApiProperty({ type: () => ProjectTypeTranslation, isArray: true })
  @OneToMany(() => ProjectTypeTranslation, translation => translation.projectType, {
    cascade: true,
    eager: true,
  })
  translations: Relation<ProjectTypeTranslation[]>;
}
