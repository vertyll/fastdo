import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { PrivacyPolicySection } from './privacy-policy-section.entity';

@Entity('privacy_policy')
export class PrivacyPolicy {
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

  @ApiProperty({ type: () => PrivacyPolicySection, isArray: true })
  @OneToMany(() => PrivacyPolicySection, section => section.privacyPolicy, {
    cascade: true,
  })
  public sections: Relation<PrivacyPolicySection[]>;
}
