export type User = {
  id: number;
  email: string;
  avatar?: {
    id: string;
    url: string;
  } | null;
  password: string;
  newPassword: string;
  isEmailConfirmed: boolean;
  dateCreation: Date;
  dateModification: Date | null;
};
