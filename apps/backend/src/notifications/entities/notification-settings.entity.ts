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
  id: number;

  @ApiProperty()
  @Column({ type: 'boolean', default: true })
  emailNotifications: boolean;

  @ApiProperty()
  @Column({ type: 'boolean', default: true })
  appNotifications: boolean;

  @ApiProperty()
  @Column({ type: 'boolean', default: true })
  projectInvitations: boolean;

  @ApiProperty()
  @Column({ type: 'boolean', default: true })
  taskAssignments: boolean;

  @ApiProperty()
  @Column({ type: 'boolean', default: true })
  taskComments: boolean;

  @ApiProperty()
  @Column({ type: 'boolean', default: true })
  taskStatusChanges: boolean;

  @ApiProperty()
  @Column({ type: 'boolean', default: true })
  projectUpdates: boolean;

  @ApiProperty()
  @Column({ type: 'boolean', default: true })
  systemNotifications: boolean;

  @ApiProperty()
  @CreateDateColumn()
  dateCreation: Date;

  @ApiProperty()
  @UpdateDateColumn()
  dateModification: Date;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  user: Relation<User>;
}
