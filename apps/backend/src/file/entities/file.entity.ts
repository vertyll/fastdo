import { StorageType } from 'src/config/types/app.config.type';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('file')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  filename: string;

  @Column({ type: 'text' })
  originalName: string;

  @Column({ type: 'text' })
  path: string;

  @Column({ type: 'text' })
  mimetype: string;

  @Column({ type: 'text' })
  encoding: string;

  @Column('bigint')
  size: number;

  @Column({ type: 'enum', enum: StorageType })
  storageType: StorageType;

  @Column({ type: 'text', nullable: true })
  url: string | null;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;
}
