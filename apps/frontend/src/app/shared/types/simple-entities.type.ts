export interface SimplePriority {
  id: number;
  name: string;
}

export interface SimpleProjectCategory {
  id: number;
  name: string;
}

export interface SimpleProjectStatus {
  id: number;
  name: string;
}

export interface SimpleProjectRole {
  id: number;
  name: string;
  description?: string;
}

export interface SimpleUser {
  id: number;
  name: string;
}

export interface SimpleRole {
  id: number;
  code: string;
  name: string;
  description?: string;
}
