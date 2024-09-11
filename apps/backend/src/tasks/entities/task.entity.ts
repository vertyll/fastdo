import { Project } from "../../projects/entities/project.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Relation,
} from "typeorm";

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

  @Column()
  projectId: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  dateCreation: Date;

  @Column({ type: "timestamp", nullable: true })
  dateModification: Date;

  @ManyToOne(() => Project, (project) => project.tasks)
  @JoinColumn({ name: "project_id" })
  project: Relation<Project>;
}
