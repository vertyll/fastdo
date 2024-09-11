import { UserRole } from "../../users/entities/user-role.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Relation,
} from "typeorm";

@Entity("role")
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: Relation<UserRole[]>;
}
