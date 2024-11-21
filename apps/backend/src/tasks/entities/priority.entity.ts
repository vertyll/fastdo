import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('priority')
export class Priority {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
