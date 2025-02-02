import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { StorageType } from '../../config/types/app.config.type';

@Entity('file')
export class File {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'document.pdf' })
  @Column({ type: 'text' })
  filename: string;

  @ApiProperty({ example: 'Original Document.pdf' })
  @Column({ type: 'text' })
  originalName: string;

  @ApiProperty({ example: '2025/01/22/document.pdf' })
  @Column({ type: 'text' })
  path: string;

  @ApiProperty({ example: 'application/pdf' })
  @Column({ type: 'text' })
  mimetype: string;

  @ApiProperty({ example: 'utf-8' })
  @Column({ type: 'text' })
  encoding: string;

  @ApiProperty({ example: 1024576 })
  @Column('bigint')
  size: number;

  @ApiProperty({ enum: StorageType, example: StorageType.LOCAL })
  @Column({ type: 'enum', enum: StorageType })
  storageType: StorageType;

  @ApiProperty({ example: '/uploads/2025/01/22/document.pdf', nullable: true })
  @Column({ type: 'text', nullable: true })
  url: string | null;

  @ApiProperty({
    example: { compression: 'high', category: 'documents' },
    nullable: true,
  })
  @Column('jsonb', { nullable: true })
  metadata: Record<string, any> | null;

  @ApiProperty({ example: '2025-01-22T12:00:00Z' })
  @CreateDateColumn()
  dateCreation: Date;

  @ApiProperty({ example: '2025-01-22T12:00:00Z' })
  @UpdateDateColumn()
  dateModification: Date;

  @ApiProperty({ example: null, nullable: true })
  @DeleteDateColumn({ nullable: true })
  dateDeletion: Date | null;
}
