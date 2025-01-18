import { applyDecorators } from '@nestjs/common';
import { ApiResponse, getSchemaPath } from '@nestjs/swagger';

interface ApiWrappedResponseOptions {
  status: number;
  description?: string;
  type?: any;
  isArray?: boolean;
}

export function ApiWrappedResponse(options: ApiWrappedResponseOptions) {
  let dataSchema: any;

  if (options.type) {
    if (options.type === String) {
      dataSchema = { type: 'string' };
    } else if (options.type === Number) {
      dataSchema = { type: 'number' };
    } else if (options.type === Boolean) {
      dataSchema = { type: 'boolean' };
    } else if (options.isArray) {
      dataSchema = {
        type: 'array',
        items: { $ref: getSchemaPath(options.type) },
      };
    } else {
      dataSchema = { $ref: getSchemaPath(options.type) };
    }
  }

  return applyDecorators(
    ApiResponse({
      status: options.status,
      description: options.description,
      schema: {
        properties: {
          data: dataSchema,
          statusCode: { type: 'number' },
          timestamp: { type: 'string' },
          path: { type: 'string' },
          method: { type: 'string' },
          message: { type: 'string' },
        },
      },
    }),
  );
}
