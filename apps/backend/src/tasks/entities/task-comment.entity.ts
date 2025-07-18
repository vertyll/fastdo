import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TaskCommentAttachment } from './task-comment-attachment.entity';
import { Task } from './task.entity';

@Entity('task_comment')
export class TaskComment {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: 'text' })
  content: string;

  @ApiProperty()
  @CreateDateColumn()
  dateCreation: Date;

  @ApiProperty()
  @UpdateDateColumn()
  dateModification: Date;

  @ApiProperty({ type: () => Task })
  @ManyToOne(() => Task, task => task.comments, { onDelete: 'CASCADE' })
  task: Relation<Task>;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  author: Relation<User>;

  @ApiProperty({ type: () => TaskCommentAttachment, isArray: true })
  @OneToMany(() => TaskCommentAttachment, attachment => attachment.comment, { cascade: true })
  commentAttachments: Relation<TaskCommentAttachment[]>;
}
