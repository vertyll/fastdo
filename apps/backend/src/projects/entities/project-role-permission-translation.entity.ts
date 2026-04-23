import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Language } from '../../core/language/entities/language.entity';
import { ProjectRolePermission } from './project-role-permission.entity';

@Entity('project_role_permission_translation')
export class ProjectRolePermissionTranslation {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty()
  @Column()
  public name: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  public description: string | null;

  @ApiProperty()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public dateCreation: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  public dateModification: Date | null;

  @ManyToOne(() => ProjectRolePermission, permission => permission.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_role_permission_id' })
  public permission: Relation<ProjectRolePermission>;

  @ManyToOne(() => Language, { eager: true })
  @JoinColumn({ name: 'language_id' })
  public language: Relation<Language>;
}
