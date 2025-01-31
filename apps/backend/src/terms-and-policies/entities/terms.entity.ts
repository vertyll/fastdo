import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { TermsSection } from './terms-section.entity';

@Entity('terms')
export class Terms {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  version: string;

  @ApiProperty()
  @Column({ type: 'timestamp' })
  dateEffective: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreation: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  dateModification: Date | null;

  @ApiProperty({ type: () => TermsSection })
  @OneToMany(() => TermsSection, section => section.terms, {
    cascade: true,
  })
  sections: Relation<TermsSection[]>;
}
