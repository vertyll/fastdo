import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Language } from '../../core/language/entities/language.entity';
import { Role } from './role.entity';

@Entity('role_translation')
export class RoleTranslation {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  description: string | null;

  @ApiProperty()
  @Column()
  dateCreation: Date;

  @ApiProperty()
  @Column()
  dateModification: Date;

  @ApiProperty({ type: () => Language })
  @ManyToOne(() => Language, { eager: true })
  language: Relation<Language>;

  @ApiProperty({ type: () => Role })
  @ManyToOne(() => Role, role => role.translations)
  role: Relation<Role>;
}
