import { Exclude } from 'class-transformer';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('refresh_token')
export class RefreshToken {
  @Exclude()
  @PrimaryGeneratedColumn()
  public id: number;

  @Exclude()
  @Column()
  @Index()
  public token: string;

  @Exclude()
  @Column()
  @Index()
  public dateExpiration: Date;

  @Exclude()
  @ManyToOne(() => User, user => user.refreshTokens)
  @JoinColumn()
  @Index()
  public user: Relation<User>;

  constructor(partial: Partial<RefreshToken>) {
    Object.assign(this, partial);
  }
}
