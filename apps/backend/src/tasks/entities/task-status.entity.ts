import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { TaskStatusTranslation } from './task-status-translation.entity';

@Entity('task_status')
export class TaskStatus {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty()
  @Column({ type: 'varchar' })
  public color: string;

  @ApiProperty()
  @Column({ default: true })
  public isActive: boolean;

  @ApiProperty()
  @Column({ default: false })
  public isDefault: boolean;

  @ApiProperty({ type: () => TaskStatusTranslation, isArray: true })
  @OneToMany(() => TaskStatusTranslation, translation => translation.taskStatus, {
    cascade: true,
    eager: true,
  })
  public translations: Relation<TaskStatusTranslation[]>;
}
