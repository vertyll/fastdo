import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { ProjectCategoryTranslation } from './project-category-translation.entity';
import { Project } from './project.entity';

@Entity('project_category')
export class ProjectCategory {
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
  @ManyToOne(() => Project, project => project.categories, { onDelete: 'CASCADE' })
  public project: Relation<Project>;

  @ApiProperty({ type: () => ProjectCategoryTranslation, isArray: true })
  @OneToMany(() => ProjectCategoryTranslation, translation => translation.projectCategory, {
    cascade: true,
    eager: true,
  })
  public translations: Relation<ProjectCategoryTranslation[]>;
}
