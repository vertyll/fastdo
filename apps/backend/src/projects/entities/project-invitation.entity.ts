import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ProjectInvitationStatusEnum } from '../enums/project-invitation-status.enum';
import { ProjectRole } from './project-role.entity';
import { Project } from './project.entity';

@Entity('project_invitation')
export class ProjectInvitation {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => Project })
  @ManyToOne(() => Project, { eager: true, onDelete: 'CASCADE' })
  project: Relation<Project>;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user: Relation<User>;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  inviter: Relation<User>;

  @ApiProperty({ type: () => ProjectRole })
  @ManyToOne(() => ProjectRole, {
    eager: true,
    onDelete: 'SET NULL',
    nullable: true,
  })
  role: Relation<ProjectRole> | null;

  @ApiProperty({ enum: ProjectInvitationStatusEnum })
  @Column({
    type: 'enum',
    enum: ProjectInvitationStatusEnum,
    default: ProjectInvitationStatusEnum.PENDING,
  })
  status: ProjectInvitationStatusEnum;

  @ApiProperty()
  @CreateDateColumn()
  dateCreated: Date;

  @ApiProperty()
  @UpdateDateColumn()
  dateUpdated: Date;
}
