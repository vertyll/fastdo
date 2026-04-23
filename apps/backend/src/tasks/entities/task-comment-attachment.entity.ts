import { ApiProperty } from '@nestjs/swagger';
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from 'typeorm';
import { File } from '../../core/file/entities/file.entity';
import { TaskComment } from './task-comment.entity';

@Entity('task_comment_attachment')
export class TaskCommentAttachment {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty()
  @CreateDateColumn()
  public dateCreation: Date;

  @ApiProperty()
  @UpdateDateColumn()
  public dateModification: Date;

  @ApiProperty({ type: () => TaskComment })
  @ManyToOne(() => TaskComment, comment => comment.commentAttachments, { onDelete: 'CASCADE' })
  public comment: Relation<TaskComment>;

  @ApiProperty({ type: () => File })
  @ManyToOne(() => File, file => file.id, { onDelete: 'CASCADE' })
  public file: Relation<File>;
}
