import { TasksListViewMode } from './task.type';

/*
 * Interface
 */
export interface NavModule {
  id: string;
  title: string;
  icon: string;
  route: string;
  sections: NavSection[];
}

export interface NavSection {
  id: string;
  title: string;
  icon: string;
  route: string;
}

/*
 * Type
 */
export type AppConfigState = {
  tasksListView: TasksListViewMode;
};
