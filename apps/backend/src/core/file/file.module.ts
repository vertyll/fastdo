import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileConfigService } from './config/file-config';
import { File } from './entities/file.entity';
import { FileFacade } from './facade/file.facade';
import { FileController } from './file.controler';
import { FileService } from './file.service';
import { FileRepository } from './repositories/file.repository';
import { FilePathBuilder } from './storage/file-path.builder';
import { LocalStorageService } from './storage/providers/local-storage.service';
import { StorageStrategy } from './storage/storage-strategy';
import { FileValidator } from './validators/file-validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    ConfigModule,
  ],
  providers: [
    FileService,
    FileValidator,
    FileConfigService,
    StorageStrategy,
    LocalStorageService,
    FilePathBuilder,
    FileRepository,
    FileFacade,
  ],
  exports: [FileService],
  controllers: [FileController],
})
export class FileModule {}
