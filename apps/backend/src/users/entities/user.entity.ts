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
  public id: number;

  @ApiProperty()
  @Column({ unique: true })
  public email: string;

  @ApiProperty()
  @Column()
  @Exclude()
  public password: string;

  @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
  public refreshTokens: Relation<RefreshToken[]>;

  @ApiProperty()
  @Column({ default: true })
  public isActive: boolean;

  @ApiProperty()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public dateCreation: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  public dateModification: Date | null;

  @ApiProperty({ type: () => UserRole })
  @OneToMany(() => UserRole, userRole => userRole.user)
  public userRoles: Relation<UserRole[]>;

  @ApiProperty()
  @Column({ default: false })
  public isEmailConfirmed: boolean;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  public confirmationToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  @Exclude()
  public confirmationTokenExpiry: Date | null;

  @ApiProperty()
  @Column({ default: false })
  public termsAccepted: boolean;

  @ApiProperty()
  @Column({ default: false })
  public privacyPolicyAccepted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  public dateTermsAcceptance: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  public datePrivacyPolicyAcceptance: Date | null;

  @ApiProperty({ type: () => File })
  @ManyToOne(() => File, { nullable: true, onDelete: 'SET NULL' })
  public avatar: Relation<File> | null;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  public emailChangeToken: string | null;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  public pendingEmail: string | null;

  @Column({ type: 'timestamp', nullable: true })
  @Exclude()
  public emailChangeTokenExpiry: Date | null;

  @OneToMany(() => ProjectUserRole, projectUserRole => projectUserRole.user)
  public projectUserRoles: Relation<ProjectUserRole[]>;

  @OneToMany(() => UserEmailHistory, userEmailHistory => userEmailHistory.user)
  public emailHistories: Relation<UserEmailHistory[]>;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
