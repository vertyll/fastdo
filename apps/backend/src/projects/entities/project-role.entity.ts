import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { ProjectRoleEnum } from '../enums/project-role.enum';
import { ProjectRolePermission } from './project-role-permission.entity';
import { ProjectRoleTranslation } from './project-role-translation.entity';
import { ProjectUserRole } from './project-user-role.entity';

@Entity('project_role')
export class ProjectRole {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ enum: ProjectRoleEnum, enumName: 'ProjectRoleEnum' })
  @Column({ type: 'enum', enum: ProjectRoleEnum, unique: true })
  code: ProjectRoleEnum;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreation: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  dateModification: Date;

  @OneToMany(() => ProjectRoleTranslation, translation => translation.projectRole, { cascade: true })
  translations: Relation<ProjectRoleTranslation[]>;

  @OneToMany(() => ProjectUserRole, userRole => userRole.projectRole)
  userRoles: Relation<ProjectUserRole[]>;

  @ManyToMany(() => ProjectRolePermission, permission => permission.roles)
  permissions: Relation<ProjectRolePermission[]>;
}
