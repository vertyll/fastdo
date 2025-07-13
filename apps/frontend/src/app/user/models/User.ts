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

type Avatar = {
  id: string;
  url: string;
};
