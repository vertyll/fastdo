import { Exclude } from 'class-transformer';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('refresh_token')
export class RefreshToken {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @Column()
  @Index()
  token: string;

  @Exclude()
  @Column()
  @Index()
  dateExpiration: Date;

  @Exclude()
  @ManyToOne(() => User, user => user.refreshTokens)
  @JoinColumn()
  @Index()
  user: Relation<User>;

  constructor(partial: Partial<RefreshToken>) {
    Object.assign(this, partial);
  }
}
