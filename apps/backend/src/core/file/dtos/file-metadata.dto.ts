import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';
import { StorageTypeEnum } from '../../config/types/app.config.type';

export class FileMetadataDto {
  @ApiProperty({ required: false })
  @IsOptional()
  public readonly id?: string;

  @ApiProperty()
  public readonly filename: string;

  @ApiProperty()
  public readonly originalName: string;

  @ApiProperty()
  public readonly path: string;

  @ApiProperty()
  public readonly mimetype: string;

  @ApiProperty()
  public readonly size: number;

  @ApiProperty()
  public readonly encoding: string;

  @ApiProperty({ required: false })
  @IsOptional()
  public readonly url?: string;

  @ApiProperty({ enum: StorageTypeEnum })
  public readonly storageType: StorageTypeEnum;

  @ApiProperty({ type: Object, required: false })
  @IsOptional()
  @IsObject()
  public readonly metadata?: Record<string, any>;
}
