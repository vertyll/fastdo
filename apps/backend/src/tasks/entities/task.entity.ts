import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';
import { Priority } from './priority.entity';

@Entity('task')
export class Task {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({ default: false })
  isDone: boolean;

  @ApiProperty()
  @Column({ default: false })
  isUrgent: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  projectId: number | null;

  @ApiProperty()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreation: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  dateModification: Date | null;

  @ApiProperty({ type: () => Project })
  @ManyToOne(() => Project, project => project.tasks, { nullable: true })
  project: Relation<Project> | null;

  @ApiProperty({ type: () => Priority })
  @ManyToOne(() => Priority, priority => priority.id, { nullable: true })
  priority: Relation<Priority> | null;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, user => user.id, { nullable: true })
  user: Relation<User> | null;

  @ApiProperty()
  @Column({ default: false })
  isPrivate: boolean;
}
