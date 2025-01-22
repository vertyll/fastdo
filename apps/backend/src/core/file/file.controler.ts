import { MultipartFile } from '@fastify/multipart';
import { Controller, Delete, Get, Param, Post, Query, UseInterceptors } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { UploadedFile } from '../../common/decorators/uploaded-file.decorator';
import { FastifyFileInterceptor } from '../../common/interceptors/fastify-file.interceptor';
import { File } from './entities/file.entity';
import { FileService } from './file.service';
import { FileMetadata } from './interfaces/file-metadata.interface';
import { FileUploadOptions } from './interfaces/file-upload-options.interface';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Public()
  @Post('upload')
  @UseInterceptors(new FastifyFileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: MultipartFile,
    @Query() options?: FileUploadOptions,
  ): Promise<FileMetadata> {
    return this.fileService.uploadFile(file, options);
  }

  @Public()
  @Delete(':id')
  async deleteFile(@Param('id') id: string): Promise<void> {
    await this.fileService.deleteFile(id);
  }

  @Public()
  @Get(':id')
  async getFile(@Param('id') id: string): Promise<File> {
    return this.fileService.getFile(id);
  }
}
