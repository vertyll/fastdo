import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { User } from './user.entity';

@Entity('user_email_history')
export class UserEmailHistory {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  oldEmail: string;

  @ApiProperty()
  @Column()
  newEmail: string;

  @ApiProperty()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateChange: Date;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User)
  user: Relation<User>;
}
