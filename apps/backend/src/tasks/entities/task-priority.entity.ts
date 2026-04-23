import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { TaskPriorityEnum } from '../enums/task-priority.enum';
import { TaskPriorityTranslation } from './task-priority-translation.entity';

@Entity('task_priority')
export class TaskPriority {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty({ enum: TaskPriorityEnum })
  @Column({ type: 'enum', enum: TaskPriorityEnum })
  public code: TaskPriorityEnum;

  @ApiProperty()
  @Column({ type: 'varchar' })
  public color: string;

  @ApiProperty()
  @Column({ default: true })
  public isActive: boolean;

  @ApiProperty()
  @CreateDateColumn()
  public dateCreation: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  public dateModification: Date | null;

  @ApiProperty({ type: () => TaskPriorityTranslation, isArray: true })
  @OneToMany(() => TaskPriorityTranslation, translation => translation.priority, {
    cascade: true,
    eager: true,
  })
  public translations: Relation<TaskPriorityTranslation[]>;
}
