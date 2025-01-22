import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';
import { StorageType } from 'src/core/config/types/app.config.type';

export class FileMetadataDto {
  @ApiProperty({ required: false })
  @IsOptional()
  id?: string;

  @ApiProperty()
  filename: string;

  @ApiProperty()
  originalName: string;

  @ApiProperty()
  path: string;

  @ApiProperty()
  mimetype: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  encoding: string;

  @ApiProperty({ required: false })
  @IsOptional()
  url?: string;

  @ApiProperty({ enum: StorageType })
  storageType: StorageType;

  @ApiProperty({ type: Object, required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
