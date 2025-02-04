import { ApiProperty } from '@nestjs/swagger';
import { Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from './project.entity';

@Entity('project_user')
export class ProjectUser {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => Project })
  @ManyToOne(() => Project, project => project.projectUsers)
  project: Relation<Project>;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, user => user.projectUsers)
  user: Relation<User>;
}
