import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { TaskPriorityEnum } from '../enums/task-priority.enum';
import { TaskPriorityTranslation } from './task-priority-translation.entity';

@Entity('task_priority')
export class TaskPriority {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ enum: TaskPriorityEnum })
  @Column({ type: 'enum', enum: TaskPriorityEnum })
  code: TaskPriorityEnum;

  @ApiProperty()
  @Column({ type: 'varchar' })
  color: string;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn()
  dateCreation: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  dateModification: Date | null;

  @ApiProperty({ type: () => TaskPriorityTranslation, isArray: true })
  @OneToMany(() => TaskPriorityTranslation, translation => translation.priority, {
    cascade: true,
    eager: true,
  })
  translations: Relation<TaskPriorityTranslation[]>;
}
