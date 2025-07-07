import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { ProjectRoleTranslation } from './project-role-translation.entity';
import { ProjectUserRole } from './project-user-role.entity';

@Entity('project_role')
export class ProjectRole {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ unique: true })
  code: string;

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
}
