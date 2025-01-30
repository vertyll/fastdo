import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { UserRole } from './user-role.entity';

@Entity('user')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column()
  @Exclude()
  password: string;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreation: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  dateModification: Date | null;

  @ApiProperty({ type: () => UserRole })
  @OneToMany(() => UserRole, userRole => userRole.user)
  userRoles: Relation<UserRole[]>;

  @ApiProperty()
  @Column({ default: false })
  isEmailConfirmed: boolean;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  confirmationToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  @Exclude()
  confirmationTokenExpiry: Date | null;

  @ApiProperty()
  @Column({ default: false })
  termsAccepted: boolean;

  @ApiProperty()
  @Column({ default: false })
  privacyPolicyAccepted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  dateTermsAcceptance: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  datePrivacyPolicyAcceptance: Date | null;
}
