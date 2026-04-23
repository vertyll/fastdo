import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { ProjectTypeEnum } from '../enums/project-type.enum';
import { ProjectTypeTranslation } from './project-type-translation.entity';
import { Project } from './project.entity';

@Entity('project_type')
export class ProjectType {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty({ enum: ProjectTypeEnum, enumName: 'ProjectTypeEnum' })
  @Column({ type: 'enum', enum: ProjectTypeEnum, unique: true })
  public code: ProjectTypeEnum;

  @ApiProperty()
  @Column({ default: true })
  public isActive: boolean;

  @ApiProperty({ type: () => Project })
  @OneToMany(() => Project, project => project.type)
  public projects: Relation<Project[]>;

  @ApiProperty({ type: () => ProjectTypeTranslation, isArray: true })
  @OneToMany(() => ProjectTypeTranslation, translation => translation.projectType, {
    cascade: true,
    eager: true,
  })
  public translations: Relation<ProjectTypeTranslation[]>;
}
