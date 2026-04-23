import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Language } from '../../core/language/entities/language.entity';
import { TaskPriority } from './task-priority.entity';

@Entity('task_priority_translation')
export class TaskPriorityTranslation {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty()
  @Column({ type: 'varchar' })
  public name: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  public description: string | null;

  @ApiProperty()
  @CreateDateColumn()
  public dateCreation: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  public dateModification: Date | null;

  @ApiProperty({ type: () => Language })
  @ManyToOne(() => Language, language => language.code, { onDelete: 'CASCADE', eager: true })
  public language: Relation<Language>;

  @ApiProperty({ type: () => TaskPriority })
  @ManyToOne(() => TaskPriority, priority => priority.translations, { onDelete: 'CASCADE' })
  public priority: Relation<TaskPriority>;
}
