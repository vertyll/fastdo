import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TaskCommentAttachment } from './task-comment-attachment.entity';
import { Task } from './task.entity';

@Entity('task_comment')
export class TaskComment {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty()
  @Column({ type: 'text' })
  public content: string;

  @ApiProperty()
  @CreateDateColumn()
  public dateCreation: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  public dateModification: Date | null;

  @ApiProperty({ type: () => Task })
  @ManyToOne(() => Task, task => task.comments, { onDelete: 'CASCADE' })
  public task: Relation<Task>;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  public author: Relation<User>;

  @ApiProperty({ type: () => TaskCommentAttachment, isArray: true })
  @OneToMany(() => TaskCommentAttachment, attachment => attachment.comment, { cascade: true })
  public commentAttachments: Relation<TaskCommentAttachment[]>;
}
