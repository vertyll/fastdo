import { Relation } from 'typeorm';
import { UserRole } from '../../users/entities/user-role.entity';

export interface ValidatedUser {
  id: number;
  email: string;
  isActive: boolean;
  dateCreation: Date;
  dateModification: Date | null;
  userRoles: Relation<UserRole[]>;
  roles: string[];
}
