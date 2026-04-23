import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { TermsSection } from './terms-section.entity';

@Entity('terms')
export class Terms {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty()
  @Column()
  public version: string;

  @ApiProperty()
  @Column({ type: 'timestamp' })
  public dateEffective: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public dateCreation: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  public dateModification: Date | null;

  @ApiProperty({ type: () => TermsSection })
  @OneToMany(() => TermsSection, section => section.terms, {
    cascade: true,
  })
  public sections: Relation<TermsSection[]>;
}
