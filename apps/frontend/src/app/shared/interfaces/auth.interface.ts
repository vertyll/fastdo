export interface RegisterResponse {
  email: string;
  password: string;
  dateModification: Date | null;
  id: number;
  isActive: boolean;
  dateCreation: Date;
}

export interface LoginResponse {
  access_token: string;
}
