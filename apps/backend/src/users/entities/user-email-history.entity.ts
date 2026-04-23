import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { User } from './user.entity';

@Entity('user_email_history')
export class UserEmailHistory {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty()
  @Column()
  public oldEmail: string;

  @ApiProperty()
  @Column()
  public newEmail: string;

  @ApiProperty()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public dateChange: Date;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, user => user.emailHistories)
  public user: Relation<User>;
}
