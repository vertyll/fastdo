import { ApiProperty } from '@nestjs/swagger';
import { Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { User } from './user.entity';

@Entity('user_role')
export class UserRole {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, user => user.userRoles)
  public user: Relation<User>;

  @ApiProperty({ type: () => Role })
  @ManyToOne(() => Role, role => role.userRoles)
  public role: Relation<Role>;
}
