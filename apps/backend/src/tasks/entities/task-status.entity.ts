import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { TaskStatusTranslation } from './task-status-translation.entity';

@Entity('task_status')
export class TaskStatus {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: 'varchar' })
  color: string;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @Column({ default: false })
  isDefault: boolean;

  @ApiProperty({ type: () => TaskStatusTranslation, isArray: true })
  @OneToMany(() => TaskStatusTranslation, translation => translation.taskStatus, {
    cascade: true,
    eager: true,
  })
  translations: Relation<TaskStatusTranslation[]>;
}
