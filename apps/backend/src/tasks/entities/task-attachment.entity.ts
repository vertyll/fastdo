import { ApiProperty } from '@nestjs/swagger';
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from 'typeorm';
import { File } from '../../core/file/entities/file.entity';
import { Task } from './task.entity';

@Entity('task_attachment')
export class TaskAttachment {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty()
  @CreateDateColumn()
  public dateCreation: Date;

  @ApiProperty()
  @UpdateDateColumn()
  public dateModification: Date;

  @ApiProperty({ type: () => Task })
  @ManyToOne(() => Task, task => task.taskAttachments, { onDelete: 'CASCADE' })
  public task: Relation<Task>;

  @ApiProperty({ type: () => File })
  @ManyToOne(() => File, file => file.id, { onDelete: 'CASCADE' })
  public file: Relation<File>;
}
