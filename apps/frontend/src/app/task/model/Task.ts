export type Task = {
  id: number;
  done: boolean;
  name: string;
  createdAt: string;
  updatedAt: string | null;
  urgent: boolean;
  project: {
    id: number;
    name: string;
  } | null;
};
