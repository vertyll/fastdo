export type { ProjectCategory, ProjectRole, ProjectStatus } from '../../project/defs/project.defs';

export interface Role {
  id: number;
  name: string;
  description: string | null;
}
