import { ApiProperty } from '@nestjs/swagger';
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from 'typeorm';
import { File } from '../../core/file/entities/file.entity';
import { Task } from './task.entity';

@Entity('task_attachment')
export class TaskAttachment {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @CreateDateColumn()
  dateCreation: Date;

  @ApiProperty()
  @UpdateDateColumn()
  dateModification: Date;

  @ApiProperty({ type: () => Task })
  @ManyToOne(() => Task, task => task.taskAttachments, { onDelete: 'CASCADE' })
  task: Relation<Task>;

  @ApiProperty({ type: () => File })
  @ManyToOne(() => File, file => file.id, { onDelete: 'CASCADE' })
  file: Relation<File>;
}
