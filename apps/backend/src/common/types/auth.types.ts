import { ApiProperty } from '@nestjs/swagger';
import { Relation } from 'typeorm';
import { UserRole } from '../../users/entities/user-role.entity';

export class LoginResponse {
  @ApiProperty()
  access_token: string;
}

export interface ValidatedUser {
  id: number;
  email: string;
  isActive: boolean;
  dateCreation: Date;
  dateModification: Date | null;
  userRoles: Relation<UserRole[]>;
  roles: string[];
}
