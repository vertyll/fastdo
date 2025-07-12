import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { NotificationStatusEnum } from '../enums/notification-status.enum';
import { NotificationTypeEnum } from '../enums/notification-type.enum';
import { NotificationTranslation } from './notification-translation.entity';

@Entity('notification')
export class Notification {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ enum: NotificationTypeEnum })
  @Column({ type: 'enum', enum: NotificationTypeEnum })
  type: NotificationTypeEnum;

  @ApiProperty({ enum: NotificationStatusEnum })
  @Column({ type: 'enum', enum: NotificationStatusEnum, default: NotificationStatusEnum.UNREAD })
  status: NotificationStatusEnum;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  data?: any;

  @ApiProperty()
  @CreateDateColumn()
  dateCreation: Date;

  @ApiProperty()
  @UpdateDateColumn()
  dateModification: Date;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  recipient: Relation<User>;

  @ApiProperty({ type: () => NotificationTranslation, isArray: true })
  @OneToMany(() => NotificationTranslation, translation => translation.notification, {
    cascade: true,
    eager: true,
  })
  translations: Relation<NotificationTranslation[]>;
}
