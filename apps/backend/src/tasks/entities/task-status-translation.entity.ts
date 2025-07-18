import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Language } from '../../core/language/entities/language.entity';
import { TaskStatus } from './task-status.entity';

@Entity('task_status_translation')
export class TaskStatusTranslation {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ type: () => Language })
  @ManyToOne(() => Language, language => language.code, { onDelete: 'CASCADE', eager: true })
  language: Relation<Language>;

  @ApiProperty({ type: () => TaskStatus })
  @ManyToOne(() => TaskStatus, status => status.translations, { onDelete: 'CASCADE' })
  taskStatus: Relation<TaskStatus>;
}
