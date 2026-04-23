import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { File } from '../../core/file/entities/file.entity';
import { Task } from '../../tasks/entities/task.entity';
import { ProjectCategory } from './project-category.entity';
import { ProjectStatus } from './project-status.entity';
import { ProjectType } from './project-type.entity';
import { ProjectUserRole } from './project-user-role.entity';

@Entity('project')
export class Project {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty()
  @Column({ type: 'varchar' })
  public name: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  public description: string | null;

  @ApiProperty()
  @Column({ default: false })
  public isPublic: boolean;

  @ApiProperty({ type: () => File })
  @ManyToOne(() => File, { nullable: true, onDelete: 'SET NULL' })
  public icon: Relation<File> | null;

  @ApiProperty()
  @Column({ default: true })
  public isActive: boolean;

  @ApiProperty()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public dateCreation: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  public dateModification: Date | null;

  @ApiProperty({ type: () => ProjectType })
  @ManyToOne(() => ProjectType, projectType => projectType.projects, { nullable: true })
  public type: Relation<ProjectType> | null;

  @ApiProperty({ type: () => Task })
  @OneToMany(() => Task, task => task.project, { onDelete: 'CASCADE' })
  public tasks: Relation<Task[]>;

  @ApiProperty({ type: () => ProjectUserRole })
  @OneToMany(() => ProjectUserRole, projectUserRole => projectUserRole.project)
  public projectUserRoles: Relation<ProjectUserRole[]>;

  @ApiProperty({ type: () => ProjectCategory })
  @OneToMany(() => ProjectCategory, category => category.project)
  public categories: Relation<ProjectCategory[]>;

  @ApiProperty({ type: () => ProjectStatus })
  @OneToMany(() => ProjectStatus, status => status.project)
  public statuses: Relation<ProjectStatus[]>;
}
