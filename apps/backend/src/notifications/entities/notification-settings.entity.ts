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
import { User } from '../../users/entities/user.entity';

@Entity('notification_settings')
export class NotificationSettings {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty()
  @Column({ type: 'boolean', default: true })
  public emailNotifications: boolean;

  @ApiProperty()
  @Column({ type: 'boolean', default: true })
  public appNotifications: boolean;

  @ApiProperty()
  @Column({ type: 'boolean', default: true })
  public projectInvitations: boolean;

  @ApiProperty()
  @Column({ type: 'boolean', default: true })
  public taskAssignments: boolean;

  @ApiProperty()
  @Column({ type: 'boolean', default: true })
  public taskComments: boolean;

  @ApiProperty()
  @Column({ type: 'boolean', default: true })
  public taskStatusChanges: boolean;

  @ApiProperty()
  @Column({ type: 'boolean', default: true })
  public projectUpdates: boolean;

  @ApiProperty()
  @Column({ type: 'boolean', default: true })
  public systemNotifications: boolean;

  @ApiProperty()
  @CreateDateColumn()
  public dateCreation: Date;

  @ApiProperty()
  @UpdateDateColumn()
  public dateModification: Date;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  public user: Relation<User>;
}
