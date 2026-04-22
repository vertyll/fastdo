export type User = {
  id: number;
  email: string;
  avatar?: Avatar;
  password: string;
  newPassword: string;
  isEmailConfirmed: boolean;
  dateCreation: Date;
  dateModification: Date | null;
};

export type Avatar = {
  id: string;
  url: string;
};

export interface UserStateModel {
  user: User;
  loading: boolean;
  error: string | null;
}
