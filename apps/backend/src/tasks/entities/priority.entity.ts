import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { TaskPriorityEnum } from '../enums/task-priority.enum';
import { PriorityTranslation } from './priority-translation.entity';

@Entity('priority')
export class Priority {
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
  @UpdateDateColumn()
  dateModification: Date;

  @ApiProperty({ type: () => PriorityTranslation, isArray: true })
  @OneToMany(() => PriorityTranslation, translation => translation.priority, {
    cascade: true,
    eager: true,
  })
  translations: Relation<PriorityTranslation[]>;
}
