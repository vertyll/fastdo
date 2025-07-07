import { ApiProperty } from '@nestjs/swagger';
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from 'typeorm';
import { File } from '../../core/file/entities/file.entity';
import { TaskComment } from './task-comment.entity';

@Entity('task_comment_attachment')
export class TaskCommentAttachment {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @CreateDateColumn()
  dateCreation: Date;

  @ApiProperty()
  @UpdateDateColumn()
  dateModification: Date;

  @ApiProperty({ type: () => TaskComment })
  @ManyToOne(() => TaskComment, comment => comment.commentAttachments, { onDelete: 'CASCADE' })
  comment: Relation<TaskComment>;

  @ApiProperty({ type: () => File })
  @ManyToOne(() => File, file => file.id, { onDelete: 'CASCADE' })
  file: Relation<File>;
}
