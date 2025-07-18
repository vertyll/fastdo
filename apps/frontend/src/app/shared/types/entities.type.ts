export interface TaskPriority {
  id: number;
  name: string;
}

export interface ProjectCategory {
  id: number;
  name: string;
}

export interface ProjectStatus {
  id: number;
  name: string;
}

export interface ProjectRole {
  id: number;
  name: string;
  description?: string;
}

export interface User {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  code: string;
  name: string;
  description?: string;
}
