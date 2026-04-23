import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { LanguageCodeEnum } from '../enums/language-code.enum';

@Entity('language')
export class Language {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty({ enum: LanguageCodeEnum, enumName: 'LanguageCodeEnum' })
  @Column({
    type: 'enum',
    enum: LanguageCodeEnum,
    unique: true,
  })
  public code: LanguageCodeEnum;

  @ApiProperty()
  @Column({ length: 100 })
  public name: string;

  @ApiProperty()
  @Column({ default: true })
  public isActive: boolean;

  @ApiProperty()
  @Column({ default: false })
  public isDefault: boolean;
}
