import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';

@Entity('project')
export class Project {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreation: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  dateModification: Date;

  @ApiProperty({ type: () => Task })
  @OneToMany(() => Task, task => task.project, { onDelete: 'CASCADE' })
  tasks: Relation<Task[]>;
}
