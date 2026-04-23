import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Language } from '../../core/language/entities/language.entity';
import { Notification } from './notification.entity';

@Entity('notification_translation')
export class NotificationTranslation {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty()
  @Column({ length: 100 })
  public title: string;

  @ApiProperty()
  @Column('text')
  public message: string;

  @ApiProperty({ type: () => Language })
  @ManyToOne(() => Language, { eager: true })
  public language: Relation<Language>;

  @ApiProperty({ type: () => Notification })
  @ManyToOne(() => Notification, notification => notification.translations, { onDelete: 'CASCADE' })
  public notification: Relation<Notification>;
}
