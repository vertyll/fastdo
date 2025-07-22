import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
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
  description: string | null;

  @ApiProperty()
  @CreateDateColumn()
  dateCreation: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  dateModification: Date | null;

  @ApiProperty({ type: () => Language })
  @ManyToOne(() => Language, language => language.code, { onDelete: 'CASCADE', eager: true })
  language: Relation<Language>;

  @ApiProperty({ type: () => TaskPriority })
  @ManyToOne(() => TaskPriority, priority => priority.translations, { onDelete: 'CASCADE' })
  priority: Relation<TaskPriority>;
}
