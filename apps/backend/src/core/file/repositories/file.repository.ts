import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileMetadataDto } from '../dtos/file-metadata.dto';
import { File } from '../entities/file.entity';

@Injectable()
export class FileRepository {
  constructor(
    @InjectRepository(File) private readonly repository: Repository<File>,
  ) {}

  async save(metadata: FileMetadataDto): Promise<File> {
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
