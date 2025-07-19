import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Language } from '../../core/language/entities/language.entity';
import { TaskCategory } from './task-category.entity';

@Entity('task_category_translation')
export class TaskCategoryTranslation {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ type: () => Language })
  @ManyToOne(() => Language, language => language.code, { onDelete: 'CASCADE', eager: true })
  language: Relation<Language>;

  @ApiProperty({ type: () => TaskCategory })
  @ManyToOne(() => TaskCategory, category => category.translations, { onDelete: 'CASCADE' })
  taskCategory: Relation<TaskCategory>;
}
