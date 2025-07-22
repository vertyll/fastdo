import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { RoleEnum } from '../../common/enums/role.enum';
import { UserRole } from '../../users/entities/user-role.entity';
import { RoleTranslation } from './role-translation.entity';

@Entity('role')
export class Role {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ enum: RoleEnum, enumName: 'RoleEnum' })
  @Column({ type: 'enum', enum: RoleEnum, unique: true })
  code: RoleEnum;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @Column()
  dateCreation: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  dateModification: Date | null;

  @ApiProperty({ type: () => UserRole })
  @OneToMany(() => UserRole, userRole => userRole.role)
  userRoles: Relation<UserRole[]>;

  @ApiProperty({ type: () => RoleTranslation })
  @OneToMany(() => RoleTranslation, translation => translation.role)
  translations: Relation<RoleTranslation[]>;
}
