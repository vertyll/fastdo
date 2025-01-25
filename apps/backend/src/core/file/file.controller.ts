import { MultipartFile } from '@fastify/multipart';
import { Controller, Delete, Get, Param, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../common/decorators/api-wrapped-response.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UploadedFile } from '../../common/decorators/uploaded-file.decorator';
import { FastifyFileInterceptor } from '../../common/interceptors/fastify-file.interceptor';
import { FileMetadataDto } from './dtos/file-metadata.dto';
import { File } from './entities/file.entity';
import { FileService } from './file.service';
import { FileUploadOptions } from './interfaces/file-upload-options.interface';

@ApiTags('file')
@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
  ) {}

  @Public()
  @Post('upload')
  @UseInterceptors(new FastifyFileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiWrappedResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: FileMetadataDto,
  })
  async uploadFile(
    @UploadedFile() file: MultipartFile,
    @Query() options?: FileUploadOptions,
  ): Promise<FileMetadataDto> {
    return this.fileService.uploadFile(file, options);
  }

  @Public()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiWrappedResponse({
    status: 200,
    description: 'File deleted successfully',
  })
  async deleteFile(@Param('id') id: string): Promise<void> {
    await this.fileService.deleteFile(id);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get file by id' })
  @ApiWrappedResponse({
    status: 200,
    description: 'Returns file information',
    type: File,
  })
  async getFile(@Param('id') id: string): Promise<File> {
    return this.fileService.getFile(id);
  }
}
