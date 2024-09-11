export type Task = {
  id: number;
  isDone: boolean;
  name: string;
  dateCreation: string;
  dateModification: string | null;
  isUrgent: boolean;
  project: {
    id: number;
    name: string;
  } | null;
};
