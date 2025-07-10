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
import { Language } from '../../core/language/entities/language.entity';
import { TaskPriority } from './task-priority.entity';

@Entity('task_priority_translation')
export class TaskPriorityTranslation {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty()
  @CreateDateColumn()
  dateCreation: Date;

  @ApiProperty()
  @UpdateDateColumn()
  dateModification: Date;

  @ApiProperty({ type: () => Language })
  @ManyToOne(() => Language, language => language.code, { onDelete: 'CASCADE', eager: true })
  language: Relation<Language>;

  @ApiProperty({ type: () => TaskPriority })
  @ManyToOne(() => TaskPriority, priority => priority.translations, { onDelete: 'CASCADE' })
  priority: Relation<TaskPriority>;
}
