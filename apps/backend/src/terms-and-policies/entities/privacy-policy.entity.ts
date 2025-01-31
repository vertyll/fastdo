import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { PrivacyPolicySection } from './privacy-policy-section.entity';

@Entity('privacy_policy')
export class PrivacyPolicy {
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

  @ApiProperty({ type: () => PrivacyPolicySection, isArray: true })
  @OneToMany(() => PrivacyPolicySection, section => section.privacyPolicy, {
    cascade: true,
  })
  sections: Relation<PrivacyPolicySection[]>;
}
