import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';

@Entity('project')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreation: Date;

  @Column({ type: 'timestamp', nullable: true })
  dateModification: Date;

  @OneToMany(() => Task, task => task.project, { onDelete: 'CASCADE' })
  tasks: Relation<Task[]>;
}
