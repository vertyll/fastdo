import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { StorageTypeEnum } from '../../config/types/app.config.type';

@Entity('file')
export class File {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ApiProperty({ example: 'document.pdf' })
  @Column({ type: 'text' })
  public filename: string;

  @ApiProperty({ example: 'Original Document.pdf' })
  @Column({ type: 'text' })
  public originalName: string;

  @ApiProperty({ example: '2025/01/22/document.pdf' })
  @Column({ type: 'text' })
  public path: string;

  @ApiProperty({ example: 'application/pdf' })
  @Column({ type: 'text' })
  public mimetype: string;

  @ApiProperty({ example: 'utf-8' })
  @Column({ type: 'text' })
  public encoding: string;

  @ApiProperty({ example: 1024576 })
  @Column('bigint')
  public size: number;

  @ApiProperty({ enum: StorageTypeEnum, example: StorageTypeEnum.LOCAL })
  @Column({ type: 'enum', enum: StorageTypeEnum })
  public storageType: StorageTypeEnum;

  @ApiProperty({ example: '/uploads/2025/01/22/document.pdf', nullable: true })
  @Column({ type: 'text', nullable: true })
  public url: string | null;

  @ApiProperty({
    example: { compression: 'high', category: 'documents' },
    nullable: true,
  })
  @Column('jsonb', { nullable: true })
  public metadata: Record<string, any> | null;

  @ApiProperty({ example: '2025-01-22T12:00:00Z' })
  @CreateDateColumn()
  public dateCreation: Date;

  @ApiProperty({ example: '2025-01-22T12:00:00Z' })
  @UpdateDateColumn()
  public dateModification: Date;

  @ApiProperty({ example: null, nullable: true })
  @DeleteDateColumn({ nullable: true })
  public dateDeletion: Date | null;
}
