import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Language } from '../../core/language/entities/language.entity';
import { Priority } from './priority.entity';

@Entity('priority_translation')
export class PriorityTranslation {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty()
  @CreateDateColumn()
  dateCreation: Date;

  @ApiProperty()
  @UpdateDateColumn()
  dateModification: Date;

  @ApiProperty({ type: () => Language })
  @ManyToOne(() => Language, language => language.code, { onDelete: 'CASCADE' })
  language: Relation<Language>;

  @ApiProperty({ type: () => Priority })
  @ManyToOne(() => Priority, priority => priority.translations, { onDelete: 'CASCADE' })
  priority: Relation<Priority>;
}
