import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Language } from '../../core/language/entities/language.entity';
import { ProjectRole } from './project-role.entity';

@Entity('project_role_translation')
export class ProjectRoleTranslation {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreation: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  dateModification: Date;

  @ManyToOne(() => ProjectRole, projectRole => projectRole.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_role_id' })
  projectRole: Relation<ProjectRole>;

  @ManyToOne(() => Language, { eager: true })
  @JoinColumn({ name: 'language_id' })
  language: Relation<Language>;
}
