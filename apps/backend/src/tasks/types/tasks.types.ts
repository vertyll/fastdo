import { ProjectCategory } from 'src/projects/entities/project-category.entity';
import { ProjectRole } from 'src/projects/entities/project-role.entity';
import { ProjectStatus } from 'src/projects/entities/project-status.entity';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';
import { TaskPriority } from '../entities/task-priority.entity';

export interface TaskData {
  description: string;
  additionalDescription?: string;
  priceEstimation: number;
  workedTime: number;
  createdBy: Pick<User, 'id'>;
  project: Pick<Project, 'id'>;
  accessRole?: Pick<ProjectRole, 'id'>;
  assignedUsers?: Pick<User, 'id'>[];
  categories?: Pick<ProjectCategory, 'id'>[];
  status?: Pick<ProjectStatus, 'id'>;
  priority?: Pick<TaskPriority, 'id'>;
}
