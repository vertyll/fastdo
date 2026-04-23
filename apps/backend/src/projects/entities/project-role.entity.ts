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
  public id: number;

  @ApiProperty({ enum: ProjectRoleEnum, enumName: 'ProjectRoleEnum' })
  @Column({ type: 'enum', enum: ProjectRoleEnum, unique: true })
  public code: ProjectRoleEnum;

  @ApiProperty()
  @Column({ default: true })
  public isActive: boolean;

  @ApiProperty()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public dateCreation: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  public dateModification: Date | null;

  @OneToMany(() => ProjectRoleTranslation, translation => translation.projectRole, { cascade: true })
  public translations: Relation<ProjectRoleTranslation[]>;

  @OneToMany(() => ProjectUserRole, userRole => userRole.projectRole)
  public userRoles: Relation<ProjectUserRole[]>;

  @ManyToMany(() => ProjectRolePermission, permission => permission.roles)
  public permissions: Relation<ProjectRolePermission[]>;
}
