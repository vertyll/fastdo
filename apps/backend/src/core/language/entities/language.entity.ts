import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { LanguageCodeEnum } from '../enums/language-code.enum';

@Entity('language')
export class Language {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ enum: LanguageCodeEnum, enumName: 'LanguageCodeEnum' })
  @Column({
    type: 'enum',
    enum: LanguageCodeEnum,
    unique: true,
  })
  code: LanguageCodeEnum;

  @ApiProperty()
  @Column({ length: 100 })
  name: string;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @Column({ default: false })
  isDefault: boolean;
}
