import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ProjectRole } from './project-role.entity';
import { Project } from './project.entity';

@Entity('project_user_role')
export class ProjectUserRole {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => Project })
  @ManyToOne(() => Project, project => project.userRoles)
  project: Relation<Project>;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, user => user.projectUserRoles)
  user: Relation<User>;

  @ApiProperty({ type: () => ProjectRole })
  @ManyToOne(() => ProjectRole, projectRole => projectRole.userRoles, { nullable: false })
  @JoinColumn({ name: 'project_role_id' })
  projectRole: Relation<ProjectRole>;

  @ApiProperty()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateAssigned: Date;
}
