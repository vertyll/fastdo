import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../entities/file.entity';
import { FileMetadata } from '../interfaces/file-metadata.interface';

@Injectable()
export class FileRepository {
  constructor(
    @InjectRepository(File) private readonly repository: Repository<File>,
  ) {}

  async save(metadata: FileMetadata): Promise<File> {
    const file = this.repository.create(metadata);
    return this.repository.save(file);
  }

  async findById(id: string): Promise<File | null> {
    return this.repository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
