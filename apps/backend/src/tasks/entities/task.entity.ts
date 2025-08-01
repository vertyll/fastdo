import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { ProjectCategory } from '../../projects/entities/project-category.entity';
import { ProjectRole } from '../../projects/entities/project-role.entity';
import { ProjectStatus } from '../../projects/entities/project-status.entity';
import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';
import { TaskAttachment } from './task-attachment.entity';
import { TaskComment } from './task-comment.entity';
import { TaskPriority } from './task-priority.entity';

@Entity('task')
export class Task {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: 'text' })
  description: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  additionalDescription: string | null;

  @ApiProperty({ description: 'Price estimation in hours (0-100, where 100 = 1 hour)' })
  @Column({ type: 'int', default: 0 })
  priceEstimation: number;

  @ApiProperty({ description: 'Worked time in hours (0-100, where 100 = 1 hour)' })
  @Column({ type: 'int', default: 0 })
  workedTime: number;

  @ApiProperty({ type: () => ProjectRole })
  @ManyToOne(() => ProjectRole, { nullable: true })
  accessRole: Relation<ProjectRole> | null;

  @ApiProperty()
  @CreateDateColumn()
  dateCreation: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  dateModification: Date | null;

  @ApiProperty({ type: () => Project })
  @ManyToOne(() => Project, project => project.tasks, { onDelete: 'CASCADE' })
  project: Relation<Project>;

  @ApiProperty({ type: () => User, isArray: true })
  @ManyToMany(() => User, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'task_assigned_user',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  assignedUsers: Relation<User[]>;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  createdBy: Relation<User>;

  @ApiProperty({ type: () => TaskPriority })
  @ManyToOne(() => TaskPriority, priority => priority.id, { onDelete: 'SET NULL' })
  priority: Relation<TaskPriority>;

  @ApiProperty({ type: () => ProjectCategory, isArray: true })
  @ManyToMany(() => ProjectCategory, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'task_category',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: Relation<ProjectCategory[]>;

  @ApiProperty({ type: () => ProjectStatus, required: false })
  @ManyToOne(() => ProjectStatus, status => status.id, { nullable: true, onDelete: 'SET NULL' })
  status: Relation<ProjectStatus> | null;

  @ApiProperty({ type: () => TaskAttachment, isArray: true })
  @OneToMany(() => TaskAttachment, attachment => attachment.task, { cascade: true })
  taskAttachments: Relation<TaskAttachment[]>;

  @ApiProperty({ type: () => TaskComment, isArray: true })
  @OneToMany(() => TaskComment, comment => comment.task, { cascade: true })
  comments: Relation<TaskComment[]>;
}
