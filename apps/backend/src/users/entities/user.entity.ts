import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { File } from '../../core/file/entities/file.entity';
import { ProjectUserRole } from '../../projects/entities/project-user-role.entity';
import { UserEmailHistory } from './user-email-history.entity';
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

  @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
  refreshTokens: Relation<RefreshToken[]>;

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

  @ApiProperty({ type: () => File })
  @ManyToOne(() => File, { nullable: true, onDelete: 'SET NULL' })
  avatar: Relation<File> | null;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  emailChangeToken: string | null;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  pendingEmail: string | null;

  @Column({ type: 'timestamp', nullable: true })
  @Exclude()
  emailChangeTokenExpiry: Date | null;

  @OneToMany(() => ProjectUserRole, projectUserRole => projectUserRole.user)
  projectUserRoles: Relation<ProjectUserRole[]>;

  @OneToMany(() => UserEmailHistory, userEmailHistory => userEmailHistory.user)
  emailHistories: Relation<UserEmailHistory[]>;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
