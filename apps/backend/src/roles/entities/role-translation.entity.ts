import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Language } from '../../core/language/entities/language.entity';
import { Role } from './role.entity';

@Entity('role_translation')
export class RoleTranslation {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty()
  @Column()
  public name: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  public description: string | null;

  @ApiProperty()
  @Column()
  public dateCreation: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  public dateModification: Date | null;

  @ApiProperty({ type: () => Language })
  @ManyToOne(() => Language, { eager: true })
  public language: Relation<Language>;

  @ApiProperty({ type: () => Role })
  @ManyToOne(() => Role, role => role.translations)
  public role: Relation<Role>;
}
