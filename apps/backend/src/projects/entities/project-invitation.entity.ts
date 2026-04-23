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
  public id: number;

  @ApiProperty({ type: () => Project })
  @ManyToOne(() => Project, { eager: true, onDelete: 'CASCADE' })
  public project: Relation<Project>;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  public user: Relation<User>;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  public inviter: Relation<User>;

  @ApiProperty({ type: () => ProjectRole })
  @ManyToOne(() => ProjectRole, {
    eager: true,
    onDelete: 'SET NULL',
    nullable: true,
  })
  public role: Relation<ProjectRole> | null;

  @ApiProperty({ enum: ProjectInvitationStatusEnum })
  @Column({
    type: 'enum',
    enum: ProjectInvitationStatusEnum,
    default: ProjectInvitationStatusEnum.PENDING,
  })
  public status: ProjectInvitationStatusEnum;

  @ApiProperty()
  @CreateDateColumn()
  public dateCreated: Date;

  @ApiProperty()
  @UpdateDateColumn()
  public dateUpdated: Date;
}
