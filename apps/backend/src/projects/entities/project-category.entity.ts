import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { ProjectCategoryTranslation } from './project-category-translation.entity';
import { Project } from './project.entity';

@Entity('project_category')
export class ProjectCategory {
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
  @ManyToOne(() => Project, project => project.categories, { onDelete: 'CASCADE' })
  project: Relation<Project>;

  @ApiProperty({ type: () => ProjectCategoryTranslation, isArray: true })
  @OneToMany(() => ProjectCategoryTranslation, translation => translation.projectCategory, {
    cascade: true,
    eager: true,
  })
  translations: Relation<ProjectCategoryTranslation[]>;
}
