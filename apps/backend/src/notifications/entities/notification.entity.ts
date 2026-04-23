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
  public id: number;

  @ApiProperty({ enum: NotificationTypeEnum })
  @Column({ type: 'enum', enum: NotificationTypeEnum })
  public type: NotificationTypeEnum;

  @ApiProperty({ enum: NotificationStatusEnum })
  @Column({ type: 'enum', enum: NotificationStatusEnum, default: NotificationStatusEnum.UNREAD })
  public status: NotificationStatusEnum;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  public data: any;

  @ApiProperty()
  @CreateDateColumn()
  public dateCreation: Date;

  @ApiProperty()
  @UpdateDateColumn()
  public dateModification: Date;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  public recipient: Relation<User>;

  @ApiProperty({ type: () => NotificationTranslation, isArray: true })
  @OneToMany(() => NotificationTranslation, translation => translation.notification, {
    cascade: true,
    eager: true,
  })
  public translations: Relation<NotificationTranslation[]>;
}
