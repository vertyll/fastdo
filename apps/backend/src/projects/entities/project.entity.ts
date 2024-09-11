import { Task } from "../../tasks/entities/task.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Relation,
} from "typeorm";

@Entity("project")
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  dateCreation: Date;

  @Column({ type: "timestamp", nullable: true })
  dateModification: Date;

  @OneToMany(() => Task, (task) => task.project, { onDelete: "CASCADE" })
  tasks: Relation<Task[]>;
}
