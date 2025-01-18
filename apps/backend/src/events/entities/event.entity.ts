import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index(['name', 'type'])
@Entity()
export class Event {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  type: string;

  @ApiProperty()
  @Index()
  @Column()
  name: string;

  @ApiProperty()
  @Column('json')
  payload: Record<string, any>;
}
