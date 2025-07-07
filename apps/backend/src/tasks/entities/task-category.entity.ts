import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { TaskCategoryTranslation } from './task-category-translation.entity';

@Entity('task_category')
export class TaskCategory {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: 'varchar' })
  color: string;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ type: () => TaskCategoryTranslation, isArray: true })
  @OneToMany(() => TaskCategoryTranslation, translation => translation.taskCategory, {
    cascade: true,
    eager: true,
  })
  translations: Relation<TaskCategoryTranslation[]>;
}
