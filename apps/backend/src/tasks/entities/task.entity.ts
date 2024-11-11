import { Project } from "../../projects/entities/project.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Relation,
} from "typeorm";
import { Priority } from "./priority.entity";

@Entity("task")
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: false })
  isDone: boolean;

  @Column({ default: false })
  isUrgent: boolean;

  @Column({ nullable: true })
  projectId: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  dateCreation: Date;

  @Column({ type: "timestamp", nullable: true })
  dateModification: Date;

  @ManyToOne(() => Project, (project) => project.tasks, { nullable: true })
  project: Relation<Project>;

  @ManyToOne(() => Priority, (priority) => priority.id, { nullable: true })
  priority: Relation<Priority>;
}
