import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { UserRole } from '../../users/entities/user-role.entity';

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => UserRole, userRole => userRole.role)
  userRoles: Relation<UserRole[]>;
}
