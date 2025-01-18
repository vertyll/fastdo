import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { UserRole } from '../../users/entities/user-role.entity';

@Entity('role')
export class Role {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ unique: true })
  name: string;

  @ApiProperty({ type: () => UserRole })
  @OneToMany(() => UserRole, userRole => userRole.role)
  userRoles: Relation<UserRole[]>;
}
