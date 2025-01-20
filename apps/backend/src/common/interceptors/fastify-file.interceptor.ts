import { MultipartFile } from '@fastify/multipart';
import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';

@Injectable()
export class FastifyFileInterceptor implements NestInterceptor {
  constructor(private fieldName: string) {}

  public async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    const file = await this.extractFile(request, this.fieldName);

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    (request as any).incomingFile = file;
    return next.handle();
  }

  private async extractFile(request: FastifyRequest, fieldName: string): Promise<MultipartFile | null> {
    if (request.body && (request.body as any)[fieldName]) {
      return (request.body as any)[fieldName];
    }

    try {
      if ('file' in request) {
        const file = await (request as any).file();
        if (file?.fieldname === fieldName) {
          return file;
        }
      }

      if ('parts' in request) {
        const parts = (request as any).parts();
        for await (const part of parts) {
          if (part.type === 'file' && part.fieldname === fieldName) {
            return part;
          }
        }
      }
    } catch (error) {
      console.error('File extraction error:', error);
    }

    return null;
  }
}
