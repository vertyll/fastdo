import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { ProjectRolePermissionEnum } from '../enums/project-role-permission.enum';
import { ProjectRolePermissionTranslation } from './project-role-permission-translation.entity';
import { ProjectRole } from './project-role.entity';

@Entity('project_role_permission')
export class ProjectRolePermission {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty({ enum: ProjectRolePermissionEnum, enumName: 'ProjectRolePermissionEnum' })
  @Column({ type: 'enum', enum: ProjectRolePermissionEnum, unique: true })
  public code: ProjectRolePermissionEnum;

  @ApiProperty()
  @Column({ default: true })
  public isActive: boolean;

  @ApiProperty()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public dateCreation: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  public dateModification: Date | null;

  @OneToMany(() => ProjectRolePermissionTranslation, translation => translation.permission, { cascade: true })
  public translations: Relation<ProjectRolePermissionTranslation[]>;

  @ManyToMany(() => ProjectRole, role => role.permissions)
  @JoinTable({ name: 'project_role_to_permission' })
  public roles: Relation<ProjectRole[]>;
}
