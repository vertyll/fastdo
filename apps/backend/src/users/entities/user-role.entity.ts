import { Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { User } from './user.entity';

@Entity('user_role')
export class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.userRoles)
  user: Relation<User>;

  @ManyToOne(() => Role, role => role.userRoles)
  role: Relation<Role>;
}
