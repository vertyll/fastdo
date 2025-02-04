export type Task = {
  id: number;
  isDone: boolean;
  name: string;
  dateCreation: string;
  dateModification: string | null;
  isUrgent: boolean;
  isPrivate: boolean;
  project: Project | null;
};

type Project = {
  id: number;
  name: string;
};
